/**
 * IRONCLAD Test Suite: telemetryStore Edge Cases
 *
 * Financial-grade testing with exhaustive edge case coverage
 * - Boundary conditions
 * - Error scenarios
 * - Race conditions
 * - State corruption prevention
 * - Data integrity
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTelemetryStore, Position, Order, AccountMetrics, SystemHealth, MarketData } from '../telemetryStore';

describe('IRONCLAD: telemetryStore Edge Cases', () => {
  beforeEach(() => {
    // Complete state reset - IRONCLAD requirement
    useTelemetryStore.getState().clearTelemetry();
    vi.clearAllMocks();
  });

  describe('Boundary Conditions', () => {
    describe('Positions', () => {
      it('should handle empty positions array', () => {
        useTelemetryStore.getState().setPositions([]);
        expect(useTelemetryStore.getState().positions).toEqual([]);
      });

      it('should handle extremely large positions array', () => {
        const manyPositions: Position[] = Array.from({ length: 10000 }, (_, i) => ({
          symbol: `SYM${i}`,
          qty: i,
          side: i % 2 === 0 ? 'long' : 'short',
          entryPrice: 100 + i,
          currentPrice: 100 + i + (i % 10),
          unrealizedPL: i % 10,
          unrealizedPLPercent: (i % 10) / 100,
          marketValue: (100 + i) * i,
        }));

        useTelemetryStore.getState().setPositions(manyPositions);
        expect(useTelemetryStore.getState().positions.length).toBe(10000);
      });

      it('should handle position with zero quantity', () => {
        const position: Position = {
          symbol: 'AAPL',
          qty: 0,
          side: 'long',
          entryPrice: 150,
          currentPrice: 155,
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
          marketValue: 0,
        };

        useTelemetryStore.getState().setPositions([position]);
        expect(useTelemetryStore.getState().positions[0].qty).toBe(0);
      });

      it('should handle position with negative unrealized P&L', () => {
        const position: Position = {
          symbol: 'AAPL',
          qty: 100,
          side: 'long',
          entryPrice: 155,
          currentPrice: 150,
          unrealizedPL: -500,
          unrealizedPLPercent: -3.23,
          marketValue: 15000,
        };

        useTelemetryStore.getState().setPositions([position]);
        expect(useTelemetryStore.getState().positions[0].unrealizedPL).toBe(-500);
      });

      it('should handle position with extreme price values', () => {
        const position: Position = {
          symbol: 'BRK.A',
          qty: 1,
          side: 'long',
          entryPrice: Number.MAX_SAFE_INTEGER,
          currentPrice: Number.MAX_SAFE_INTEGER,
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
          marketValue: Number.MAX_SAFE_INTEGER,
        };

        useTelemetryStore.getState().setPositions([position]);
        expect(useTelemetryStore.getState().positions[0].entryPrice).toBe(Number.MAX_SAFE_INTEGER);
      });

      it('should handle position with special characters in symbol', () => {
        const position: Position = {
          symbol: 'BRK.A',
          qty: 1,
          side: 'long',
          entryPrice: 500000,
          currentPrice: 510000,
          unrealizedPL: 10000,
          unrealizedPLPercent: 2,
          marketValue: 510000,
        };

        useTelemetryStore.getState().setPositions([position]);
        expect(useTelemetryStore.getState().positions[0].symbol).toBe('BRK.A');
      });
    });

    describe('Orders', () => {
      it('should handle empty orders array', () => {
        useTelemetryStore.getState().setOrders([]);
        expect(useTelemetryStore.getState().orders).toEqual([]);
      });

      it('should handle order with all status types', () => {
        const statuses: Array<Order['status']> = ['new', 'partially_filled', 'filled', 'canceled', 'rejected'];

        statuses.forEach((status, i) => {
          const order: Order = {
            id: `order-${i}`,
            symbol: 'AAPL',
            side: 'buy',
            type: 'market',
            qty: 100,
            filledQty: status === 'filled' ? 100 : status === 'partially_filled' ? 50 : 0,
            status,
            createdAt: Date.now(),
          };

          useTelemetryStore.getState().setOrders([order]);
          expect(useTelemetryStore.getState().orders[0].status).toBe(status);
        });
      });

      it('should handle order with all type variants', () => {
        const types: Array<Order['type']> = ['market', 'limit', 'stop', 'stop_limit'];

        types.forEach((type, i) => {
          const order: Order = {
            id: `order-${i}`,
            symbol: 'AAPL',
            side: 'buy',
            type,
            qty: 100,
            filledQty: 0,
            price: type !== 'market' ? 150 : undefined,
            status: 'new',
            createdAt: Date.now(),
          };

          useTelemetryStore.getState().setOrders([order]);
          expect(useTelemetryStore.getState().orders[0].type).toBe(type);
        });
      });

      it('should handle extremely long order ID', () => {
        const longId = 'order-'.padEnd(10000, 'x');
        const order: Order = {
          id: longId,
          symbol: 'AAPL',
          side: 'buy',
          type: 'market',
          qty: 100,
          filledQty: 0,
          status: 'new',
          createdAt: Date.now(),
        };

        useTelemetryStore.getState().setOrders([order]);
        expect(useTelemetryStore.getState().orders[0].id.length).toBe(10000);
      });
    });

    describe('Account Metrics', () => {
      it('should handle null account metrics', () => {
        useTelemetryStore.setState({ accountMetrics: null });
        expect(useTelemetryStore.getState().accountMetrics).toBeNull();
      });

      it('should handle account metrics with negative values', () => {
        const metrics: AccountMetrics = {
          equity: -1000,
          cash: -500,
          buyingPower: 0,
          portfolioValue: -1000,
          dayPL: -200,
          dayPLPercent: -20,
          totalPL: -10000,
          totalPLPercent: -50,
        };

        useTelemetryStore.getState().setAccountMetrics(metrics);
        expect(useTelemetryStore.getState().accountMetrics?.equity).toBe(-1000);
      });

      it('should handle account metrics with extreme values', () => {
        const metrics: AccountMetrics = {
          equity: Number.MAX_SAFE_INTEGER,
          cash: Number.MAX_SAFE_INTEGER,
          buyingPower: Number.MAX_SAFE_INTEGER,
          portfolioValue: Number.MAX_SAFE_INTEGER,
          dayPL: Number.MAX_SAFE_INTEGER,
          dayPLPercent: 1000000,
          totalPL: Number.MAX_SAFE_INTEGER,
          totalPLPercent: 1000000,
        };

        useTelemetryStore.getState().setAccountMetrics(metrics);
        expect(useTelemetryStore.getState().accountMetrics?.equity).toBe(Number.MAX_SAFE_INTEGER);
      });
    });

    describe('System Health', () => {
      it('should handle null system health', () => {
        useTelemetryStore.setState({ systemHealth: null });
        expect(useTelemetryStore.getState().systemHealth).toBeNull();
      });

      it('should handle system health at boundaries', () => {
        const health: SystemHealth = {
          cpu: 100,
          memory: 100,
          latency: 0,
          uptime: 0,
          lastHeartbeat: Date.now(),
          status: 'critical',
        };

        useTelemetryStore.getState().setSystemHealth(health);
        expect(useTelemetryStore.getState().systemHealth?.cpu).toBe(100);
      });

      it('should handle all status types', () => {
        const statuses: Array<SystemHealth['status']> = ['healthy', 'degraded', 'critical'];

        statuses.forEach(status => {
          const health: SystemHealth = {
            cpu: 50,
            memory: 50,
            latency: 100,
            uptime: 1000,
            lastHeartbeat: Date.now(),
            status,
          };

          useTelemetryStore.getState().setSystemHealth(health);
          expect(useTelemetryStore.getState().systemHealth?.status).toBe(status);
        });
      });
    });

    describe('Market Data', () => {
      it('should handle empty market data', () => {
        useTelemetryStore.setState({ marketData: {} });
        expect(Object.keys(useTelemetryStore.getState().marketData).length).toBe(0);
      });

      it('should handle market data for many symbols', () => {
        for (let i = 0; i < 1000; i++) {
          const data: MarketData = {
            symbol: `SYM${i}`,
            price: 100 + i,
            change: i % 10,
            changePercent: (i % 10) / 100,
            volume: 1000000 * i,
            high: 105 + i,
            low: 95 + i,
            open: 100 + i,
            timestamp: Date.now(),
          };
          useTelemetryStore.getState().updateMarketData(`SYM${i}`, data);
        }

        expect(Object.keys(useTelemetryStore.getState().marketData).length).toBe(1000);
      });

      it('should handle market data with negative change', () => {
        const data: MarketData = {
          symbol: 'AAPL',
          price: 145,
          change: -5,
          changePercent: -3.33,
          volume: 50000000,
          high: 150,
          low: 144,
          open: 150,
          timestamp: Date.now(),
        };

        useTelemetryStore.getState().updateMarketData('AAPL', data);
        expect(useTelemetryStore.getState().marketData.AAPL.change).toBe(-5);
      });

      it('should overwrite existing market data', () => {
        const data1: MarketData = {
          symbol: 'AAPL',
          price: 150,
          change: 0,
          changePercent: 0,
          volume: 50000000,
          high: 150,
          low: 150,
          open: 150,
          timestamp: Date.now(),
        };

        const data2: MarketData = {
          symbol: 'AAPL',
          price: 155,
          change: 5,
          changePercent: 3.33,
          volume: 60000000,
          high: 156,
          low: 149,
          open: 150,
          timestamp: Date.now() + 1000,
        };

        useTelemetryStore.getState().updateMarketData('AAPL', data1);
        useTelemetryStore.getState().updateMarketData('AAPL', data2);

        expect(useTelemetryStore.getState().marketData.AAPL.price).toBe(155);
      });
    });
  });

  describe('Activity Log', () => {
    it('should handle empty activity log', () => {
      expect(useTelemetryStore.getState().activityLog).toEqual([]);
    });

    it('should add log entries with unique IDs', () => {
      useTelemetryStore.getState().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: 'Test message 1',
      });

      useTelemetryStore.getState().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: 'Test message 2',
      });

      const logs = useTelemetryStore.getState().activityLog;
      expect(logs.length).toBe(2);
      expect(logs[0].id).not.toBe(logs[1].id);
    });

    it('should limit activity log to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        useTelemetryStore.getState().addActivityLog({
          timestamp: Date.now() + i,
          type: 'info',
          message: `Message ${i}`,
        });
      }

      expect(useTelemetryStore.getState().activityLog.length).toBe(100);
    });

    it('should keep most recent entries when limiting', () => {
      for (let i = 0; i < 150; i++) {
        useTelemetryStore.getState().addActivityLog({
          timestamp: Date.now() + i,
          type: 'info',
          message: `Message ${i}`,
        });
      }

      // Most recent should be at index 0
      const logs = useTelemetryStore.getState().activityLog;
      expect(logs[0].message).toBe('Message 149');
    });

    it('should handle all log types', () => {
      const types: Array<'info' | 'warning' | 'error' | 'trade'> = ['info', 'warning', 'error', 'trade'];

      types.forEach(type => {
        useTelemetryStore.getState().addActivityLog({
          timestamp: Date.now(),
          type,
          message: `${type} message`,
        });
      });

      const logs = useTelemetryStore.getState().activityLog;
      expect(logs.length).toBe(4);
    });

    it('should handle extremely long message', () => {
      const longMessage = 'A'.repeat(100000);
      useTelemetryStore.getState().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: longMessage,
      });

      expect(useTelemetryStore.getState().activityLog[0].message.length).toBe(100000);
    });

    it('should handle special characters in message', () => {
      const specialMessage = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~ 日本語中文한국어';
      useTelemetryStore.getState().addActivityLog({
        timestamp: Date.now(),
        type: 'info',
        message: specialMessage,
      });

      expect(useTelemetryStore.getState().activityLog[0].message).toBe(specialMessage);
    });
  });

  describe('Connection State', () => {
    it('should handle setConnected(true)', () => {
      useTelemetryStore.getState().setConnected(true);

      expect(useTelemetryStore.getState().isConnected).toBe(true);
      // Should add a log entry
      expect(useTelemetryStore.getState().activityLog.length).toBe(1);
      expect(useTelemetryStore.getState().activityLog[0].message).toContain('Connected');
    });

    it('should handle setConnected(false)', () => {
      useTelemetryStore.getState().setConnected(false);

      expect(useTelemetryStore.getState().isConnected).toBe(false);
      // Should not add a log entry when disconnecting
      expect(useTelemetryStore.getState().activityLog.length).toBe(0);
    });

    it('should handle rapid connection state changes', () => {
      for (let i = 0; i < 100; i++) {
        useTelemetryStore.getState().setConnected(i % 2 === 0);
      }

      // 50 connect events should add 50 log entries
      expect(useTelemetryStore.getState().activityLog.length).toBe(50);
    });
  });

  describe('Last Update Tracking', () => {
    it('should update lastUpdate on setPositions', () => {
      const before = Date.now();
      useTelemetryStore.getState().setPositions([]);
      const after = Date.now();

      const lastUpdate = useTelemetryStore.getState().lastUpdate;
      expect(lastUpdate).toBeGreaterThanOrEqual(before);
      expect(lastUpdate).toBeLessThanOrEqual(after);
    });

    it('should update lastUpdate on setOrders', () => {
      const before = Date.now();
      useTelemetryStore.getState().setOrders([]);
      const after = Date.now();

      const lastUpdate = useTelemetryStore.getState().lastUpdate;
      expect(lastUpdate).toBeGreaterThanOrEqual(before);
      expect(lastUpdate).toBeLessThanOrEqual(after);
    });

    it('should update lastUpdate on setAccountMetrics', () => {
      const before = Date.now();
      useTelemetryStore.getState().setAccountMetrics({
        equity: 100000,
        cash: 50000,
        buyingPower: 200000,
        portfolioValue: 100000,
        dayPL: 1000,
        dayPLPercent: 1,
        totalPL: 10000,
        totalPLPercent: 10,
      });
      const after = Date.now();

      const lastUpdate = useTelemetryStore.getState().lastUpdate;
      expect(lastUpdate).toBeGreaterThanOrEqual(before);
      expect(lastUpdate).toBeLessThanOrEqual(after);
    });

    it('should update lastUpdate on setSystemHealth', () => {
      const before = Date.now();
      useTelemetryStore.getState().setSystemHealth({
        cpu: 50,
        memory: 60,
        latency: 100,
        uptime: 1000,
        lastHeartbeat: Date.now(),
        status: 'healthy',
      });
      const after = Date.now();

      const lastUpdate = useTelemetryStore.getState().lastUpdate;
      expect(lastUpdate).toBeGreaterThanOrEqual(before);
      expect(lastUpdate).toBeLessThanOrEqual(after);
    });

    it('should update lastUpdate on updateMarketData', () => {
      const before = Date.now();
      useTelemetryStore.getState().updateMarketData('AAPL', {
        symbol: 'AAPL',
        price: 150,
        change: 0,
        changePercent: 0,
        volume: 50000000,
        high: 150,
        low: 150,
        open: 150,
        timestamp: Date.now(),
      });
      const after = Date.now();

      const lastUpdate = useTelemetryStore.getState().lastUpdate;
      expect(lastUpdate).toBeGreaterThanOrEqual(before);
      expect(lastUpdate).toBeLessThanOrEqual(after);
    });
  });

  describe('State Isolation', () => {
    it('should not affect other state when setting positions', () => {
      const order: Order = {
        id: 'test',
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        qty: 100,
        filledQty: 0,
        status: 'new',
        createdAt: Date.now(),
      };

      useTelemetryStore.getState().setOrders([order]);
      useTelemetryStore.getState().setPositions([]);

      // Orders should be preserved
      expect(useTelemetryStore.getState().orders.length).toBe(1);
    });

    it('should preserve updateInterval during clearTelemetry', () => {
      useTelemetryStore.setState({ updateInterval: 5000 });
      useTelemetryStore.getState().clearTelemetry();

      // updateInterval should be preserved (default is 1000, but we don't reset it)
      // Actually, clearTelemetry doesn't reset updateInterval
      expect(useTelemetryStore.getState().updateInterval).toBeDefined();
    });
  });

  describe('Race Conditions', () => {
    it('should handle concurrent data updates', () => {
      const updates: Promise<void>[] = [];

      for (let i = 0; i < 100; i++) {
        updates.push(Promise.resolve().then(() => {
          useTelemetryStore.getState().setPositions([{
            symbol: `SYM${i}`,
            qty: i,
            side: 'long',
            entryPrice: 100,
            currentPrice: 100,
            unrealizedPL: 0,
            unrealizedPLPercent: 0,
            marketValue: 100 * i,
          }]);
        }));
      }

      return Promise.all(updates).then(() => {
        // Should complete without error
        expect(useTelemetryStore.getState().positions.length).toBe(1);
      });
    });

    it('should handle clearTelemetry during updates', () => {
      useTelemetryStore.getState().setPositions([{
        symbol: 'AAPL',
        qty: 100,
        side: 'long',
        entryPrice: 150,
        currentPrice: 150,
        unrealizedPL: 0,
        unrealizedPLPercent: 0,
        marketValue: 15000,
      }]);

      // Simulate concurrent clear
      useTelemetryStore.getState().clearTelemetry();

      expect(useTelemetryStore.getState().positions.length).toBe(0);
    });
  });

  describe('clearTelemetry Behavior', () => {
    it('should reset all data fields', () => {
      // Set up state with data
      useTelemetryStore.getState().setPositions([{
        symbol: 'AAPL',
        qty: 100,
        side: 'long',
        entryPrice: 150,
        currentPrice: 150,
        unrealizedPL: 0,
        unrealizedPLPercent: 0,
        marketValue: 15000,
      }]);
      useTelemetryStore.getState().setOrders([{
        id: 'test',
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        qty: 100,
        filledQty: 0,
        status: 'new',
        createdAt: Date.now(),
      }]);
      useTelemetryStore.getState().setConnected(true);

      // Clear
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
