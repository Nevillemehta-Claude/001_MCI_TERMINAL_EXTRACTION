/**
 * Kite Connect API Service
 * P4 REMEDIATION: Centralized Kite API integration for Indian markets
 *
 * CR-004 COMPLIANCE: Tokens expire at 6:00 AM IST daily
 * Markets: NSE/BSE (9:15 AM - 3:30 PM IST)
 */

import { Sentry, logBackendBreadcrumb } from '../lib/sentry';

// Kite Connect API Configuration
const KITE_API_BASE = 'https://api.kite.trade';
const KITE_API_VERSION = '3';

export interface KiteCredentials {
  apiKey: string;
  accessToken: string;
  userId?: string;
}

export interface KiteUserProfile {
  user_id: string;
  user_name: string;
  email: string;
  broker: string;
  user_type: string;
  exchanges: string[];
}

export interface KiteQuote {
  instrument_token: number;
  last_price: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  volume: number;
  change: number;
}

export interface KiteOrder {
  order_id: string;
  exchange: string;
  tradingsymbol: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: string;
  order_timestamp: string;
}

export interface KitePosition {
  tradingsymbol: string;
  exchange: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
}

/**
 * Generate Kite authorization header
 */
const getAuthHeader = (credentials: KiteCredentials): string => {
  return `token ${credentials.apiKey}:${credentials.accessToken}`;
};

/**
 * Make authenticated request to Kite API
 */
const kiteRequest = async <T>(
  endpoint: string,
  credentials: KiteCredentials,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${KITE_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'X-Kite-Version': KITE_API_VERSION,
      'Authorization': getAuthHeader(credentials),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.message || `Kite API error: ${response.status}`;

    // Check for token expiry (CR-004)
    if (response.status === 403 || errorMessage.includes('expired')) {
      throw new Error('Kite token expired. Tokens expire at 6:00 AM IST daily. Please re-authenticate.');
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data as T;
};

/**
 * Kite API Service Class
 */
export class KiteService {
  private credentials: KiteCredentials;

  constructor(credentials: KiteCredentials) {
    this.credentials = credentials;
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<KiteUserProfile> {
    return Sentry.startSpan(
      { name: 'kite.api.profile', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Fetching Kite user profile', 'kite');
        return kiteRequest<KiteUserProfile>('/user/profile', this.credentials);
      }
    );
  }

  /**
   * Get quotes for instruments
   * @param instruments Array of exchange:symbol pairs (e.g., ['NSE:RELIANCE', 'BSE:TCS'])
   */
  async getQuotes(instruments: string[]): Promise<Record<string, KiteQuote>> {
    return Sentry.startSpan(
      { name: 'kite.api.quotes', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Fetching quotes', 'kite', { count: instruments.length });
        const params = instruments.map((i) => `i=${encodeURIComponent(i)}`).join('&');
        return kiteRequest<Record<string, KiteQuote>>(`/quote?${params}`, this.credentials);
      }
    );
  }

  /**
   * Get last traded price for instruments
   */
  async getLTP(instruments: string[]): Promise<Record<string, { last_price: number }>> {
    return Sentry.startSpan(
      { name: 'kite.api.ltp', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Fetching LTP', 'kite', { count: instruments.length });
        const params = instruments.map((i) => `i=${encodeURIComponent(i)}`).join('&');
        return kiteRequest<Record<string, { last_price: number }>>(`/quote/ltp?${params}`, this.credentials);
      }
    );
  }

  /**
   * Place an order
   */
  async placeOrder(order: {
    exchange: 'NSE' | 'BSE';
    tradingsymbol: string;
    transaction_type: 'BUY' | 'SELL';
    quantity: number;
    product: 'CNC' | 'MIS' | 'NRML';
    order_type: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
    price?: number;
    trigger_price?: number;
  }): Promise<{ order_id: string }> {
    return Sentry.startSpan(
      { name: 'kite.api.order.place', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Placing order', 'kite', {
          symbol: order.tradingsymbol,
          exchange: order.exchange,
          type: order.transaction_type,
          quantity: order.quantity,
        });

        const formData = new URLSearchParams();
        formData.append('exchange', order.exchange);
        formData.append('tradingsymbol', order.tradingsymbol);
        formData.append('transaction_type', order.transaction_type);
        formData.append('quantity', order.quantity.toString());
        formData.append('product', order.product);
        formData.append('order_type', order.order_type);
        if (order.price) formData.append('price', order.price.toString());
        if (order.trigger_price) formData.append('trigger_price', order.trigger_price.toString());

        return kiteRequest<{ order_id: string }>('/orders/regular', this.credentials, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
      }
    );
  }

  /**
   * Get all orders for the day
   */
  async getOrders(): Promise<KiteOrder[]> {
    return Sentry.startSpan(
      { name: 'kite.api.orders', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Fetching orders', 'kite');
        return kiteRequest<KiteOrder[]>('/orders', this.credentials);
      }
    );
  }

  /**
   * Get positions
   */
  async getPositions(): Promise<{ net: KitePosition[]; day: KitePosition[] }> {
    return Sentry.startSpan(
      { name: 'kite.api.positions', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Fetching positions', 'kite');
        return kiteRequest<{ net: KitePosition[]; day: KitePosition[] }>('/portfolio/positions', this.credentials);
      }
    );
  }

  /**
   * Get holdings (long-term portfolio)
   */
  async getHoldings(): Promise<Array<{
    tradingsymbol: string;
    exchange: string;
    quantity: number;
    average_price: number;
    last_price: number;
    pnl: number;
  }>> {
    return Sentry.startSpan(
      { name: 'kite.api.holdings', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Fetching holdings', 'kite');
        return kiteRequest('/portfolio/holdings', this.credentials);
      }
    );
  }

  /**
   * Get margins/funds
   */
  async getMargins(): Promise<{
    equity: { available: { live_balance: number; opening_balance: number } };
    commodity?: { available: { live_balance: number; opening_balance: number } };
  }> {
    return Sentry.startSpan(
      { name: 'kite.api.margins', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Fetching margins', 'kite');
        return kiteRequest('/user/margins', this.credentials);
      }
    );
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<{ order_id: string }> {
    return Sentry.startSpan(
      { name: 'kite.api.order.cancel', op: 'http.client' },
      async () => {
        logBackendBreadcrumb('Cancelling order', 'kite', { orderId });
        return kiteRequest<{ order_id: string }>(`/orders/regular/${orderId}`, this.credentials, {
          method: 'DELETE',
        });
      }
    );
  }
}

/**
 * Check if current time is within Indian market hours
 * NSE/BSE: 9:15 AM - 3:30 PM IST
 */
export const isIndianMarketOpen = (): boolean => {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcTimeMinutes = utcHours * 60 + utcMinutes;

  // 9:15 AM IST = 3:45 AM UTC = 225 minutes
  // 3:30 PM IST = 10:00 AM UTC = 600 minutes
  return utcTimeMinutes >= 225 && utcTimeMinutes < 600;
};

/**
 * Calculate time until 6:00 AM IST (token expiry)
 * CR-004 SACRED CONSTRAINT
 */
export const getTimeUntilTokenExpiry = (): number => {
  const now = new Date();
  const expiry = new Date();

  // 6:00 AM IST = 00:30 UTC
  expiry.setUTCHours(0, 30, 0, 0);

  // If we're past today's 6:00 AM IST, calculate to tomorrow's
  if (now.getTime() >= expiry.getTime()) {
    expiry.setUTCDate(expiry.getUTCDate() + 1);
  }

  return expiry.getTime() - now.getTime();
};

/**
 * Create a Kite service instance
 */
export const createKiteService = (credentials: KiteCredentials): KiteService => {
  return new KiteService(credentials);
};

export default KiteService;
