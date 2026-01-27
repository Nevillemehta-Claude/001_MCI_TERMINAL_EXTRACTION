import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Test utilities for MCI component testing
 */

// Custom render function with providers
interface WrapperProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: WrapperProps) => {
  // Add any global providers here (e.g., theme, store)
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data factories
export const createMockPosition = (overrides = {}) => ({
  symbol: 'AAPL',
  qty: 100,
  side: 'long' as const,
  entryPrice: 150.0,
  currentPrice: 155.0,
  unrealizedPL: 500.0,
  unrealizedPLPercent: 3.33,
  marketValue: 15500.0,
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: `order-${Date.now()}`,
  symbol: 'AAPL',
  side: 'buy' as const,
  type: 'limit' as const,
  qty: 100,
  filledQty: 0,
  price: 150.0,
  status: 'new' as const,
  createdAt: Date.now(),
  ...overrides,
});

export const createMockAccountMetrics = (overrides = {}) => ({
  equity: 100000,
  cash: 50000,
  buyingPower: 150000,
  portfolioValue: 100000,
  dayPL: 500,
  dayPLPercent: 0.5,
  totalPL: 5000,
  totalPLPercent: 5.0,
  ...overrides,
});

export const createMockSystemHealth = (overrides = {}) => ({
  cpu: 45,
  memory: 60,
  latency: 25,
  uptime: 3600000,
  lastHeartbeat: Date.now(),
  status: 'healthy' as const,
  ...overrides,
});

export const createMockMarketData = (symbol: string, overrides = {}) => ({
  symbol,
  price: 155.0,
  change: 2.5,
  changePercent: 1.64,
  volume: 50000000,
  high: 156.0,
  low: 152.0,
  open: 153.0,
  timestamp: Date.now(),
  ...overrides,
});

export const createMockScanCheck = (overrides = {}) => ({
  id: 'test-check',
  name: 'Test Check',
  description: 'A test check',
  category: 'system' as const,
  status: 'pending' as const,
  critical: false,
  ...overrides,
});

// Async helpers
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock API response helper
export const mockFetchResponse = (data: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

// Mock API error response
export const mockFetchError = (message: string, status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ message }),
  text: () => Promise.resolve(JSON.stringify({ message })),
});
