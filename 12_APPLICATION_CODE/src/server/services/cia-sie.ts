/**
 * CIA-SIE-PURE Engine Integration Service
 * 
 * MCI is the COCKPIT — it monitors and controls
 * CIA-SIE-PURE is the ENGINE — it executes trades
 * 
 * This service provides the communication layer between them.
 */

import { Sentry, logBackendBreadcrumb, captureTradeOperationError } from '../lib/sentry';

// Configuration
const CIA_SIE_BASE_URL = process.env.CIA_SIE_URL || 'http://localhost:8000';
const CIA_SIE_WS_URL = process.env.CIA_SIE_WS_URL || 'ws://localhost:8000/ws';

export interface EngineStatus {
  running: boolean;
  mode: 'idle' | 'active' | 'paused' | 'error';
  strategy: string | null;
  uptime: number;
  lastHeartbeat: number;
}

export interface EnginePosition {
  symbol: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

export interface EngineOrder {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'SL';
  quantity: number;
  price: number | null;
  status: 'pending' | 'open' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  createdAt: number;
  updatedAt: number;
}

export interface EngineTelemetry {
  status: EngineStatus;
  positions: EnginePosition[];
  orders: EngineOrder[];
  account: {
    equity: number;
    cash: number;
    marginUsed: number;
    marginAvailable: number;
    dayPnl: number;
    totalPnl: number;
  };
  health: {
    cpu: number;
    memory: number;
    latency: number;
    errorRate: number;
  };
  timestamp: number;
}

/**
 * Make HTTP request to CIA-SIE-PURE engine
 */
const engineRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${CIA_SIE_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Engine error: ${response.status}`);
  }

  return response.json();
};

/**
 * CIA-SIE-PURE Engine Service
 */
export class CIASIEService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onTelemetryCallback: ((data: EngineTelemetry) => void) | null = null;

  /**
   * Start the trading engine
   */
  async start(config: {
    broker: 'zerodha' | 'icici' | 'hdfc' | 'kotak';
    strategy?: string;
    kiteCredentials: {
      apiKey: string;
      accessToken: string;
    };
  }): Promise<{ success: boolean; message: string }> {
    return Sentry.startSpan(
      { name: 'cia-sie.start', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Starting CIA-SIE-PURE engine', 'cia-sie', {
          broker: config.broker,
          strategy: config.strategy,
        });

        try {
          const result = await engineRequest<{ success: boolean; message: string }>('/api/engine/start', {
            method: 'POST',
            body: JSON.stringify(config),
          });

          if (result.success) {
            logBackendBreadcrumb('CIA-SIE-PURE engine started', 'cia-sie');
          }

          return result;
        } catch (error) {
          captureTradeOperationError(error as Error, 'ignition', { broker: config.broker });
          throw error;
        }
      }
    );
  }

  /**
   * Stop the trading engine (graceful shutdown - CR-002)
   */
  async stop(emergency = false): Promise<{ success: boolean; steps: string[] }> {
    return Sentry.startSpan(
      { name: 'cia-sie.stop', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Stopping CIA-SIE-PURE engine', 'cia-sie', { emergency });

        try {
          const result = await engineRequest<{ success: boolean; steps: string[] }>(
            '/api/engine/stop',
            {
              method: 'POST',
              body: JSON.stringify({ emergency }),
            }
          );

          // Disconnect WebSocket
          this.disconnectWebSocket();

          logBackendBreadcrumb('CIA-SIE-PURE engine stopped', 'cia-sie', {
            steps: result.steps,
          });

          return result;
        } catch (error) {
          captureTradeOperationError(error as Error, 'shutdown', { emergency });
          throw error;
        }
      }
    );
  }

  /**
   * Get engine status
   */
  async getStatus(): Promise<EngineStatus> {
    return Sentry.startSpan(
      { name: 'cia-sie.status', op: 'http.client' },
      async () => {
        return engineRequest<EngineStatus>('/api/engine/status');
      }
    );
  }

  /**
   * Get full telemetry snapshot
   */
  async getTelemetry(): Promise<EngineTelemetry> {
    return Sentry.startSpan(
      { name: 'cia-sie.telemetry', op: 'http.client' },
      async () => {
        return engineRequest<EngineTelemetry>('/api/engine/telemetry');
      }
    );
  }

  /**
   * Connect to WebSocket for real-time telemetry
   */
  connectWebSocket(onTelemetry: (data: EngineTelemetry) => void): void {
    this.onTelemetryCallback = onTelemetry;
    this.establishWebSocket();
  }

  private establishWebSocket(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      return;
    }

    logBackendBreadcrumb('Connecting to CIA-SIE-PURE WebSocket', 'cia-sie');

    try {
      this.wsConnection = new WebSocket(CIA_SIE_WS_URL);

      this.wsConnection.onopen = () => {
        logBackendBreadcrumb('CIA-SIE-PURE WebSocket connected', 'cia-sie');
        this.reconnectAttempts = 0;
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as EngineTelemetry;
          this.onTelemetryCallback?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        logBackendBreadcrumb('CIA-SIE-PURE WebSocket closed', 'cia-sie', {}, 'warning');
        this.handleReconnect();
      };

      this.wsConnection.onerror = (error) => {
        logBackendBreadcrumb('CIA-SIE-PURE WebSocket error', 'cia-sie', {}, 'error');
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logBackendBreadcrumb('Max reconnect attempts reached', 'cia-sie', {}, 'error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    logBackendBreadcrumb('Reconnecting to WebSocket', 'cia-sie', {
      attempt: this.reconnectAttempts,
      delayMs: delay,
    });

    setTimeout(() => this.establishWebSocket(), delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
      logBackendBreadcrumb('CIA-SIE-PURE WebSocket disconnected', 'cia-sie');
    }
  }

  /**
   * Pause engine operations
   */
  async pause(): Promise<{ success: boolean }> {
    return engineRequest<{ success: boolean }>('/api/engine/pause', {
      method: 'POST',
    });
  }

  /**
   * Resume engine operations
   */
  async resume(): Promise<{ success: boolean }> {
    return engineRequest<{ success: boolean }>('/api/engine/resume', {
      method: 'POST',
    });
  }

  /**
   * Get positions from engine
   */
  async getPositions(): Promise<EnginePosition[]> {
    return engineRequest<EnginePosition[]>('/api/positions');
  }

  /**
   * Get orders from engine
   */
  async getOrders(): Promise<EngineOrder[]> {
    return engineRequest<EngineOrder[]>('/api/orders');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now();
    try {
      await engineRequest('/api/health');
      return {
        healthy: true,
        latency: Date.now() - start,
      };
    } catch {
      return {
        healthy: false,
        latency: Date.now() - start,
      };
    }
  }
}

// Singleton instance
let ciaSieService: CIASIEService | null = null;

/**
 * Get or create CIA-SIE service instance
 */
export const getCIASIEService = (): CIASIEService => {
  if (!ciaSieService) {
    ciaSieService = new CIASIEService();
  }
  return ciaSieService;
};

export default CIASIEService;
