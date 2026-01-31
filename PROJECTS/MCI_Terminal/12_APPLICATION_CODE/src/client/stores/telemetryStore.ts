import { create } from 'zustand';
import {
  logTradingBreadcrumb,
  captureTradeError,
} from '../lib/sentry';

export interface Position {
  symbol: string;
  qty: number;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  marketValue: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  qty: number;
  filledQty: number;
  price?: number;
  status: 'new' | 'partially_filled' | 'filled' | 'canceled' | 'rejected';
  createdAt: number;
  filledAt?: number;
}

export interface AccountMetrics {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  dayPL: number;
  dayPLPercent: number;
  totalPL: number;
  totalPLPercent: number;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  latency: number;
  uptime: number;
  lastHeartbeat: number;
  status: 'healthy' | 'degraded' | 'critical';
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

export interface TelemetryState {
  // Data
  positions: Position[];
  orders: Order[];
  accountMetrics: AccountMetrics | null;
  systemHealth: SystemHealth | null;
  marketData: Record<string, MarketData>;
  activityLog: Array<{
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error' | 'trade';
    message: string;
  }>;

  // Connection state
  isConnected: boolean;
  lastUpdate: number | null;
  updateInterval: number;

  // Actions
  setPositions: (positions: Position[]) => void;
  setOrders: (orders: Order[]) => void;
  setAccountMetrics: (metrics: AccountMetrics) => void;
  setSystemHealth: (health: SystemHealth) => void;
  updateMarketData: (symbol: string, data: MarketData) => void;
  addActivityLog: (log: Omit<TelemetryState['activityLog'][0], 'id'>) => void;
  setConnected: (connected: boolean) => void;
  clearTelemetry: () => void;
}

export const useTelemetryStore = create<TelemetryState>()((set, get) => ({
  // Initial state
  positions: [],
  orders: [],
  accountMetrics: null,
  systemHealth: null,
  marketData: {},
  activityLog: [],
  isConnected: false,
  lastUpdate: null,
  updateInterval: 1000, // 1 second default

  // Actions
  setPositions: (positions) => {
    const prevCount = get().positions.length;
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);

    // Only log breadcrumb if positions changed significantly
    if (positions.length !== prevCount) {
      logTradingBreadcrumb('Positions updated', 'telemetry', {
        count: positions.length,
        previousCount: prevCount,
        totalValue,
      });
    }

    set({ positions, lastUpdate: Date.now() });
  },

  setOrders: (orders) => {
    const prevCount = get().orders.length;
    const openCount = orders.filter((o) => o.status === 'new' || o.status === 'partially_filled').length;

    // Only log breadcrumb if orders changed
    if (orders.length !== prevCount) {
      logTradingBreadcrumb('Orders updated', 'telemetry', {
        count: orders.length,
        previousCount: prevCount,
        openCount,
      });
    }

    set({ orders, lastUpdate: Date.now() });
  },

  setAccountMetrics: (metrics) => {
    logTradingBreadcrumb('Account metrics updated', 'telemetry', {
      equity: metrics.equity,
      buyingPower: metrics.buyingPower,
      dayPL: metrics.dayPL,
    });

    set({ accountMetrics: metrics, lastUpdate: Date.now() });
  },

  setSystemHealth: (health) => {
    const prevHealth = get().systemHealth;

    // Log breadcrumb if status changed
    if (!prevHealth || prevHealth.status !== health.status) {
      logTradingBreadcrumb('System health changed', 'telemetry', {
        status: health.status,
        previousStatus: prevHealth?.status,
        cpu: health.cpu,
        memory: health.memory,
        latency: health.latency,
      }, health.status === 'critical' ? 'error' : health.status === 'degraded' ? 'warning' : 'info');
    }

    set({ systemHealth: health, lastUpdate: Date.now() });
  },

  updateMarketData: (symbol, data) => {
    set((state) => ({
      marketData: { ...state.marketData, [symbol]: data },
      lastUpdate: Date.now(),
    }));
  },

  addActivityLog: (log) => {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Capture trade-related logs to Sentry
    if (log.type === 'trade') {
      logTradingBreadcrumb(`Trade activity: ${log.message}`, 'telemetry', { type: log.type });
    } else if (log.type === 'error') {
      logTradingBreadcrumb(`Telemetry error: ${log.message}`, 'telemetry', { type: log.type }, 'error');
      captureTradeError(new Error(log.message), {
        action: 'order',
        details: { logType: log.type, timestamp: log.timestamp },
      });
    }

    set((state) => ({
      activityLog: [{ ...log, id }, ...state.activityLog].slice(0, 100), // Keep last 100
    }));
  },

  setConnected: (connected) => {
    const wasConnected = get().isConnected;

    if (connected && !wasConnected) {
      logTradingBreadcrumb('Telemetry connected', 'telemetry');
    } else if (!connected && wasConnected) {
      logTradingBreadcrumb('Telemetry disconnected', 'telemetry', {}, 'warning');
    }

    set({ isConnected: connected });
    if (connected) {
      get().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: 'Connected to telemetry stream',
      });
    }
  },

  clearTelemetry: () => {
    logTradingBreadcrumb('Telemetry cleared', 'telemetry');
    set({
      positions: [],
      orders: [],
      accountMetrics: null,
      systemHealth: null,
      marketData: {},
      activityLog: [],
      isConnected: false,
      lastUpdate: null,
    });
  },
}));

export default useTelemetryStore;
