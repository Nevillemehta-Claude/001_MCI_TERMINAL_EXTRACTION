import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { telemetryRoutes } from '../telemetry';

describe('Telemetry Routes', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/telemetry', telemetryRoutes);
    vi.clearAllMocks();
  });

  describe('GET /api/telemetry/positions', () => {
    it('should return positions array', async () => {
      const res = await app.request('/api/telemetry/positions');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.positions)).toBe(true);
      expect(data.positions.length).toBeGreaterThan(0);
    });

    it('should include timestamp', async () => {
      const res = await app.request('/api/telemetry/positions');

      const data = await res.json();
      expect(typeof data.timestamp).toBe('number');
      expect(data.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should return positions with proper structure', async () => {
      const res = await app.request('/api/telemetry/positions');

      const data = await res.json();
      for (const position of data.positions) {
        expect(typeof position.symbol).toBe('string');
        expect(typeof position.qty).toBe('number');
        expect(['long', 'short']).toContain(position.side);
        expect(typeof position.entryPrice).toBe('number');
        expect(typeof position.currentPrice).toBe('number');
        expect(typeof position.unrealizedPL).toBe('number');
        expect(typeof position.unrealizedPLPercent).toBe('number');
        expect(typeof position.marketValue).toBe('number');
      }
    });

    it('should include expected symbols', async () => {
      const res = await app.request('/api/telemetry/positions');

      const data = await res.json();
      const symbols = data.positions.map((p: { symbol: string }) => p.symbol);
      expect(symbols).toContain('AAPL');
      expect(symbols).toContain('GOOGL');
      expect(symbols).toContain('MSFT');
    });
  });

  describe('GET /api/telemetry/orders', () => {
    it('should return orders array', async () => {
      const res = await app.request('/api/telemetry/orders');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.orders)).toBe(true);
      expect(data.orders.length).toBeGreaterThan(0);
    });

    it('should include timestamp', async () => {
      const res = await app.request('/api/telemetry/orders');

      const data = await res.json();
      expect(typeof data.timestamp).toBe('number');
    });

    it('should return orders with proper structure', async () => {
      const res = await app.request('/api/telemetry/orders');

      const data = await res.json();
      for (const order of data.orders) {
        expect(typeof order.id).toBe('string');
        expect(typeof order.symbol).toBe('string');
        expect(['buy', 'sell']).toContain(order.side);
        expect(['market', 'limit', 'stop']).toContain(order.type);
        expect(typeof order.qty).toBe('number');
        expect(typeof order.filledQty).toBe('number');
        expect(typeof order.price).toBe('number');
        expect(['new', 'partially_filled', 'filled', 'canceled']).toContain(order.status);
        expect(typeof order.createdAt).toBe('number');
      }
    });

    it('should have unique order IDs', async () => {
      const res = await app.request('/api/telemetry/orders');

      const data = await res.json();
      const ids = data.orders.map((o: { id: string }) => o.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have filledQty match status', async () => {
      const res = await app.request('/api/telemetry/orders');

      const data = await res.json();
      for (const order of data.orders) {
        if (order.status === 'filled') {
          expect(order.filledQty).toBe(order.qty);
        }
        if (order.status === 'new') {
          expect(order.filledQty).toBe(0);
        }
      }
    });
  });

  describe('GET /api/telemetry/account', () => {
    it('should return account metrics', async () => {
      const res = await app.request('/api/telemetry/account');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(typeof data.equity).toBe('number');
      expect(typeof data.cash).toBe('number');
      expect(typeof data.buyingPower).toBe('number');
      expect(typeof data.portfolioValue).toBe('number');
    });

    it('should include P&L metrics', async () => {
      const res = await app.request('/api/telemetry/account');

      const data = await res.json();
      expect(typeof data.dayPL).toBe('number');
      expect(typeof data.dayPLPercent).toBe('number');
      expect(typeof data.totalPL).toBe('number');
      expect(typeof data.totalPLPercent).toBe('number');
    });

    it('should include timestamp', async () => {
      const res = await app.request('/api/telemetry/account');

      const data = await res.json();
      expect(typeof data.timestamp).toBe('number');
    });

    it('should have realistic values', async () => {
      const res = await app.request('/api/telemetry/account');

      const data = await res.json();
      expect(data.equity).toBeGreaterThan(0);
      expect(data.buyingPower).toBeGreaterThan(0);
      expect(data.cash).toBeGreaterThan(0);
    });

    it('should have buying power relative to equity', async () => {
      const res = await app.request('/api/telemetry/account');

      const data = await res.json();
      // Buying power is typically 2x equity for margin accounts
      expect(data.buyingPower).toBeGreaterThanOrEqual(data.equity);
    });
  });

  describe('GET /api/telemetry/health', () => {
    it('should return system health metrics', async () => {
      const res = await app.request('/api/telemetry/health');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(typeof data.cpu).toBe('number');
      expect(typeof data.memory).toBe('number');
      expect(typeof data.latency).toBe('number');
      expect(typeof data.uptime).toBe('number');
    });

    it('should include heartbeat timestamp', async () => {
      const res = await app.request('/api/telemetry/health');

      const data = await res.json();
      expect(typeof data.lastHeartbeat).toBe('number');
      expect(data.lastHeartbeat).toBeLessThanOrEqual(Date.now());
    });

    it('should include status', async () => {
      const res = await app.request('/api/telemetry/health');

      const data = await res.json();
      expect(['healthy', 'degraded', 'critical']).toContain(data.status);
    });

    it('should have CPU percentage in valid range', async () => {
      const res = await app.request('/api/telemetry/health');

      const data = await res.json();
      expect(data.cpu).toBeGreaterThanOrEqual(0);
      expect(data.cpu).toBeLessThanOrEqual(100);
    });

    it('should have memory percentage in valid range', async () => {
      const res = await app.request('/api/telemetry/health');

      const data = await res.json();
      expect(data.memory).toBeGreaterThanOrEqual(0);
      expect(data.memory).toBeLessThanOrEqual(100);
    });

    it('should have positive uptime', async () => {
      const res = await app.request('/api/telemetry/health');

      const data = await res.json();
      expect(data.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/telemetry/market/:symbol', () => {
    it('should return market data for AAPL', async () => {
      const res = await app.request('/api/telemetry/market/AAPL');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.symbol).toBe('AAPL');
      expect(typeof data.price).toBe('number');
    });

    it('should return market data with proper structure', async () => {
      const res = await app.request('/api/telemetry/market/GOOGL');

      const data = await res.json();
      expect(typeof data.price).toBe('number');
      expect(typeof data.change).toBe('number');
      expect(typeof data.changePercent).toBe('number');
      expect(typeof data.volume).toBe('number');
      expect(typeof data.high).toBe('number');
      expect(typeof data.low).toBe('number');
      expect(typeof data.open).toBe('number');
      expect(typeof data.timestamp).toBe('number');
    });

    it('should convert symbol to uppercase', async () => {
      const res = await app.request('/api/telemetry/market/msft');

      const data = await res.json();
      expect(data.symbol).toBe('MSFT');
    });

    it('should handle unknown symbols', async () => {
      const res = await app.request('/api/telemetry/market/UNKNOWN');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.symbol).toBe('UNKNOWN');
      expect(typeof data.price).toBe('number');
    });

    it('should have high >= low', async () => {
      const res = await app.request('/api/telemetry/market/TSLA');

      const data = await res.json();
      expect(data.high).toBeGreaterThanOrEqual(data.low);
    });
  });

  describe('GET /api/telemetry/market', () => {
    it('should return market data for multiple symbols', async () => {
      const res = await app.request('/api/telemetry/market');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(typeof data.data).toBe('object');
      expect(Object.keys(data.data).length).toBeGreaterThan(0);
    });

    it('should include timestamp', async () => {
      const res = await app.request('/api/telemetry/market');

      const data = await res.json();
      expect(typeof data.timestamp).toBe('number');
    });

    it('should include expected symbols', async () => {
      const res = await app.request('/api/telemetry/market');

      const data = await res.json();
      expect(data.data.AAPL).toBeDefined();
      expect(data.data.GOOGL).toBeDefined();
      expect(data.data.MSFT).toBeDefined();
      expect(data.data.TSLA).toBeDefined();
      expect(data.data.SPY).toBeDefined();
      expect(data.data.QQQ).toBeDefined();
    });

    it('should have proper structure for each symbol', async () => {
      const res = await app.request('/api/telemetry/market');

      const data = await res.json();
      for (const [symbol, marketData] of Object.entries(data.data) as Array<[string, { symbol: string; price: number }]>) {
        expect(marketData.symbol).toBe(symbol);
        expect(typeof marketData.price).toBe('number');
      }
    });
  });

  describe('GET /api/telemetry/snapshot', () => {
    it('should return complete telemetry snapshot', async () => {
      const res = await app.request('/api/telemetry/snapshot');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.positions)).toBe(true);
      expect(Array.isArray(data.orders)).toBe(true);
      expect(typeof data.account).toBe('object');
      expect(typeof data.health).toBe('object');
      expect(typeof data.marketData).toBe('object');
    });

    it('should include timestamp', async () => {
      const res = await app.request('/api/telemetry/snapshot');

      const data = await res.json();
      expect(typeof data.timestamp).toBe('number');
    });

    it('should have valid positions data', async () => {
      const res = await app.request('/api/telemetry/snapshot');

      const data = await res.json();
      expect(data.positions.length).toBeGreaterThan(0);
      expect(typeof data.positions[0].symbol).toBe('string');
    });

    it('should have valid orders data', async () => {
      const res = await app.request('/api/telemetry/snapshot');

      const data = await res.json();
      expect(data.orders.length).toBeGreaterThan(0);
      expect(typeof data.orders[0].id).toBe('string');
    });

    it('should have valid account data', async () => {
      const res = await app.request('/api/telemetry/snapshot');

      const data = await res.json();
      expect(typeof data.account.equity).toBe('number');
      expect(typeof data.account.cash).toBe('number');
    });

    it('should have valid health data', async () => {
      const res = await app.request('/api/telemetry/snapshot');

      const data = await res.json();
      expect(typeof data.health.cpu).toBe('number');
      expect(typeof data.health.memory).toBe('number');
      expect(data.health.status).toBe('healthy');
    });

    it('should have market data for expected symbols', async () => {
      const res = await app.request('/api/telemetry/snapshot');

      const data = await res.json();
      expect(data.marketData.AAPL).toBeDefined();
      expect(data.marketData.GOOGL).toBeDefined();
      expect(data.marketData.MSFT).toBeDefined();
      expect(data.marketData.TSLA).toBeDefined();
      expect(data.marketData.SPY).toBeDefined();
    });
  });
});
