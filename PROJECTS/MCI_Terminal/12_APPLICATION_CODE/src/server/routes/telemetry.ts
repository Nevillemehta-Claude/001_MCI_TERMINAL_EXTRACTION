import { Hono } from 'hono';

/**
 * Telemetry Routes
 * Provides real-time system data endpoints
 */

export const telemetryRoutes = new Hono();

// Simulated data generators
const generatePosition = (symbol: string) => {
  const qty = Math.floor(Math.random() * 100) + 10;
  const entryPrice = Math.random() * 200 + 50;
  const priceChange = (Math.random() - 0.5) * 10;
  const currentPrice = entryPrice + priceChange;
  const unrealizedPL = qty * priceChange;

  return {
    symbol,
    qty,
    side: Math.random() > 0.3 ? 'long' : 'short',
    entryPrice: Number(entryPrice.toFixed(2)),
    currentPrice: Number(currentPrice.toFixed(2)),
    unrealizedPL: Number(unrealizedPL.toFixed(2)),
    unrealizedPLPercent: Number(((priceChange / entryPrice) * 100).toFixed(2)),
    marketValue: Number((qty * currentPrice).toFixed(2)),
  };
};

const generateOrder = () => {
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];
  const statuses = ['new', 'partially_filled', 'filled', 'canceled'] as const;
  const types = ['market', 'limit', 'stop'] as const;

  const qty = Math.floor(Math.random() * 50) + 5;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const filledQty = status === 'filled' ? qty : status === 'partially_filled' ? Math.floor(qty / 2) : 0;

  return {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    side: Math.random() > 0.5 ? 'buy' : 'sell',
    type: types[Math.floor(Math.random() * types.length)],
    qty,
    filledQty,
    price: Number((Math.random() * 200 + 50).toFixed(2)),
    status,
    createdAt: Date.now() - Math.floor(Math.random() * 3600000),
    filledAt: status === 'filled' ? Date.now() : undefined,
  };
};

const generateMarketData = (symbol: string) => {
  const basePrice = {
    RELIANCE: 2450,
    TCS: 3800,
    INFY: 1550,
    HDFCBANK: 1650,
    ICICIBANK: 1050,
    SBIN: 620,
  }[symbol] || 1000;

  const variance = basePrice * 0.02;
  const price = basePrice + (Math.random() - 0.5) * variance;
  const change = (Math.random() - 0.5) * variance;

  return {
    symbol,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / price) * 100).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000),
    high: Number((price + Math.abs(change)).toFixed(2)),
    low: Number((price - Math.abs(change)).toFixed(2)),
    open: Number((price - change / 2).toFixed(2)),
    timestamp: Date.now(),
  };
};

// Get positions
telemetryRoutes.get('/positions', (c) => {
  const symbols = ['RELIANCE', 'TCS', 'INFY'];
  const positions = symbols.map(generatePosition);

  return c.json({
    positions,
    timestamp: Date.now(),
  });
});

// Get orders
telemetryRoutes.get('/orders', (c) => {
  const orders = Array.from({ length: 5 }, generateOrder);

  return c.json({
    orders,
    timestamp: Date.now(),
  });
});

// Get account metrics
telemetryRoutes.get('/account', (c) => {
  const equity = 100000 + Math.random() * 5000;
  const dayPL = (Math.random() - 0.5) * 2000;

  return c.json({
    equity: Number(equity.toFixed(2)),
    cash: Number((equity * 0.3).toFixed(2)),
    buyingPower: Number((equity * 2).toFixed(2)),
    portfolioValue: Number((equity * 0.7).toFixed(2)),
    dayPL: Number(dayPL.toFixed(2)),
    dayPLPercent: Number(((dayPL / equity) * 100).toFixed(2)),
    totalPL: Number((dayPL * 10).toFixed(2)),
    totalPLPercent: Number(((dayPL * 10 / equity) * 100).toFixed(2)),
    timestamp: Date.now(),
  });
});

// Get system health
telemetryRoutes.get('/health', (c) => {
  const memoryUsage = process.memoryUsage();

  return c.json({
    cpu: Math.floor(Math.random() * 40) + 10,
    memory: Math.floor((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    latency: Math.floor(Math.random() * 50) + 10,
    uptime: process.uptime() * 1000,
    lastHeartbeat: Date.now(),
    status: Math.random() > 0.95 ? 'degraded' : 'healthy',
    timestamp: Date.now(),
  });
});

// Get market data
telemetryRoutes.get('/market/:symbol', (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  return c.json(generateMarketData(symbol));
});

// Get all market data
telemetryRoutes.get('/market', (c) => {
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];
  const data: Record<string, ReturnType<typeof generateMarketData>> = {};

  for (const symbol of symbols) {
    data[symbol] = generateMarketData(symbol);
  }

  return c.json({
    data,
    timestamp: Date.now(),
  });
});

// Get full telemetry snapshot
telemetryRoutes.get('/snapshot', async (c) => {
  const symbols = ['RELIANCE', 'TCS', 'INFY'];
  const marketSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];

  return c.json({
    positions: symbols.map(generatePosition),
    orders: Array.from({ length: 3 }, generateOrder),
    account: {
      equity: 100000,
      cash: 30000,
      buyingPower: 200000,
      portfolioValue: 70000,
      dayPL: 500,
      dayPLPercent: 0.5,
      totalPL: 5000,
      totalPLPercent: 5,
    },
    health: {
      cpu: 25,
      memory: 45,
      latency: 25,
      uptime: process.uptime() * 1000,
      lastHeartbeat: Date.now(),
      status: 'healthy',
    },
    marketData: Object.fromEntries(
      marketSymbols.map((s) => [s, generateMarketData(s)])
    ),
    timestamp: Date.now(),
  });
});

export default telemetryRoutes;
