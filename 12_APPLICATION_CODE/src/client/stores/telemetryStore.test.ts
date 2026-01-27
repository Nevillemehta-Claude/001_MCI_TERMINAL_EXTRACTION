import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTelemetryStore, Position, Order, AccountMetrics, SystemHealth, MarketData } from './telemetryStore';

describe('telemetryStore', () => {
  beforeEach(() => {
    useTelemetryStore.getState().clearTelemetry();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useTelemetryStore.getState();

      expect(state.positions).toEqual([]);
      expect(state.orders).toEqual([]);
      expect(state.accountMetrics).toBeNull();
      expect(state.systemHealth).toBeNull();
      expect(state.marketData).toEqual({});
      expect(state.activityLog).toEqual([]);
      expect(state.isConnected).toBe(false);
      expect(state.lastUpdate).toBeNull();
      expect(state.updateInterval).toBe(1000);
    });
  });

  describe('setPositions', () => {
    it('should set positions and update lastUpdate', () => {
      const positions: Position[] = [
        {
          symbol: 'AAPL',
          qty: 100,
          side: 'long',
          entryPrice: 150.0,
          currentPrice: 155.0,
          unrealizedPL: 500.0,
          unrealizedPLPercent: 3.33,
          marketValue: 15500.0,
        },
      ];

      useTelemetryStore.getState().setPositions(positions);

      const state = useTelemetryStore.getState();
      expect(state.positions).toEqual(positions);
      expect(state.lastUpdate).not.toBeNull();
    });

    it('should replace existing positions', () => {
      useTelemetryStore.setState({
        positions: [{ symbol: 'OLD', qty: 1 } as Position],
      });

      const newPositions: Position[] = [{ symbol: 'NEW', qty: 2 } as Position];
      useTelemetryStore.getState().setPositions(newPositions);

      expect(useTelemetryStore.getState().positions).toEqual(newPositions);
    });
  });

  describe('setOrders', () => {
    it('should set orders and update lastUpdate', () => {
      const orders: Order[] = [
        {
          id: 'order-1',
          symbol: 'AAPL',
          side: 'buy',
          type: 'limit',
          qty: 100,
          filledQty: 0,
          price: 150.0,
          status: 'new',
          createdAt: Date.now(),
        },
      ];

      useTelemetryStore.getState().setOrders(orders);

      const state = useTelemetryStore.getState();
      expect(state.orders).toEqual(orders);
      expect(state.lastUpdate).not.toBeNull();
    });
  });

  describe('setAccountMetrics', () => {
    it('should set account metrics and update lastUpdate', () => {
      const metrics: AccountMetrics = {
        equity: 100000,
        cash: 50000,
        buyingPower: 150000,
        portfolioValue: 100000,
        dayPL: 500,
        dayPLPercent: 0.5,
        totalPL: 5000,
        totalPLPercent: 5.0,
      };

      useTelemetryStore.getState().setAccountMetrics(metrics);

      const state = useTelemetryStore.getState();
      expect(state.accountMetrics).toEqual(metrics);
      expect(state.lastUpdate).not.toBeNull();
    });
  });

  describe('setSystemHealth', () => {
    it('should set system health and update lastUpdate', () => {
      const health: SystemHealth = {
        cpu: 45,
        memory: 60,
        latency: 25,
        uptime: 3600000,
        lastHeartbeat: Date.now(),
        status: 'healthy',
      };

      useTelemetryStore.getState().setSystemHealth(health);

      const state = useTelemetryStore.getState();
      expect(state.systemHealth).toEqual(health);
      expect(state.lastUpdate).not.toBeNull();
    });

    it('should handle different health statuses', () => {
      const degradedHealth: SystemHealth = {
        cpu: 85,
        memory: 90,
        latency: 150,
        uptime: 3600000,
        lastHeartbeat: Date.now(),
        status: 'degraded',
      };

      useTelemetryStore.getState().setSystemHealth(degradedHealth);

      expect(useTelemetryStore.getState().systemHealth?.status).toBe('degraded');
    });
  });

  describe('updateMarketData', () => {
    it('should add new market data for a symbol', () => {
      const data: MarketData = {
        symbol: 'AAPL',
        price: 155.0,
        change: 2.5,
        changePercent: 1.64,
        volume: 50000000,
        high: 156.0,
        low: 152.0,
        open: 153.0,
        timestamp: Date.now(),
      };

      useTelemetryStore.getState().updateMarketData('AAPL', data);

      const state = useTelemetryStore.getState();
      expect(state.marketData['AAPL']).toEqual(data);
      expect(state.lastUpdate).not.toBeNull();
    });

    it('should update existing market data', () => {
      const initialData: MarketData = {
        symbol: 'AAPL',
        price: 150.0,
        change: 0,
        changePercent: 0,
        volume: 0,
        high: 150.0,
        low: 150.0,
        open: 150.0,
        timestamp: Date.now(),
      };

      const updatedData: MarketData = {
        ...initialData,
        price: 155.0,
        change: 5.0,
        changePercent: 3.33,
      };

      useTelemetryStore.getState().updateMarketData('AAPL', initialData);
      useTelemetryStore.getState().updateMarketData('AAPL', updatedData);

      expect(useTelemetryStore.getState().marketData['AAPL'].price).toBe(155.0);
    });

    it('should maintain data for multiple symbols', () => {
      const aaplData: MarketData = { symbol: 'AAPL', price: 155.0 } as MarketData;
      const googData: MarketData = { symbol: 'GOOG', price: 140.0 } as MarketData;

      useTelemetryStore.getState().updateMarketData('AAPL', aaplData);
      useTelemetryStore.getState().updateMarketData('GOOG', googData);

      const state = useTelemetryStore.getState();
      expect(Object.keys(state.marketData)).toHaveLength(2);
      expect(state.marketData['AAPL'].price).toBe(155.0);
      expect(state.marketData['GOOG'].price).toBe(140.0);
    });
  });

  describe('addActivityLog', () => {
    it('should add log entry with generated id', () => {
      useTelemetryStore.getState().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: 'Test message',
      });

      const state = useTelemetryStore.getState();
      expect(state.activityLog).toHaveLength(1);
      expect(state.activityLog[0].id).toMatch(/^log-/);
      expect(state.activityLog[0].message).toBe('Test message');
    });

    it('should add new logs at the beginning', () => {
      useTelemetryStore.getState().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: 'First',
      });
      useTelemetryStore.getState().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: 'Second',
      });

      const state = useTelemetryStore.getState();
      expect(state.activityLog[0].message).toBe('Second');
      expect(state.activityLog[1].message).toBe('First');
    });

    it('should limit logs to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        useTelemetryStore.getState().addActivityLog({
          timestamp: Date.now(),
          type: 'info',
          message: `Log ${i}`,
        });
      }

      expect(useTelemetryStore.getState().activityLog).toHaveLength(100);
    });

    it('should support different log types', () => {
      const types: Array<'info' | 'warning' | 'error' | 'trade'> = [
        'info',
        'warning',
        'error',
        'trade',
      ];

      types.forEach((type) => {
        useTelemetryStore.getState().addActivityLog({
          timestamp: Date.now(),
          type,
          message: `${type} message`,
        });
      });

      const state = useTelemetryStore.getState();
      expect(state.activityLog).toHaveLength(4);
    });
  });

  describe('setConnected', () => {
    it('should set connection status to true and add log', () => {
      useTelemetryStore.getState().setConnected(true);

      const state = useTelemetryStore.getState();
      expect(state.isConnected).toBe(true);
      expect(state.activityLog).toHaveLength(1);
      expect(state.activityLog[0].message).toContain('Connected');
    });

    it('should set connection status to false without log', () => {
      useTelemetryStore.getState().setConnected(false);

      const state = useTelemetryStore.getState();
      expect(state.isConnected).toBe(false);
      expect(state.activityLog).toHaveLength(0);
    });
  });

  describe('clearTelemetry', () => {
    it('should reset all telemetry state', () => {
      // Set up some state
      useTelemetryStore.setState({
        positions: [{ symbol: 'AAPL' } as Position],
        orders: [{ id: '1' } as Order],
        accountMetrics: { equity: 100000 } as AccountMetrics,
        systemHealth: { status: 'healthy' } as SystemHealth,
        marketData: { AAPL: { price: 150 } as MarketData },
        activityLog: [{ id: '1', timestamp: 1, type: 'info', message: 'test' }],
        isConnected: true,
        lastUpdate: Date.now(),
      });

      useTelemetryStore.getState().clearTelemetry();

      const state = useTelemetryStore.getState();
      expect(state.positions).toEqual([]);
      expect(state.orders).toEqual([]);
      expect(state.accountMetrics).toBeNull();
      expect(state.systemHealth).toBeNull();
      expect(state.marketData).toEqual({});
      expect(state.activityLog).toEqual([]);
      expect(state.isConnected).toBe(false);
      expect(state.lastUpdate).toBeNull();
    });
  });
});
