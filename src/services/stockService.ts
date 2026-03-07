const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

export interface PriceCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoryResponse {
  success: boolean;
  symbol: string;
  range: string;
  count: number;
  candles: PriceCandle[];
}

export interface Recommendation {
  symbol: string;
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
  period: string;
}

export interface EarningsSurprise {
  actual: number;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
}

export interface EarningsCalendar {
  date: string;
  epsActual: number | null;
  epsEstimate: number;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number;
  symbol: string;
  year: number;
}

export const stockService = {
  /**
   * Get price history for chart
   */
  async getHistory(symbol: string, range: string = '1mo'): Promise<HistoryResponse> {
    try {
      const response = await fetch(`${API_URL}/stock/${symbol}/history?range=${range}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch history');
      }

      // Normalize response - ensure candles is an array
      return {
        success: result.success ?? true,
        symbol: result.symbol ?? symbol,
        range: result.range ?? range,
        count: result.count ?? 0,
        candles: Array.isArray(result.candles) ? result.candles : [],
      };
    } catch (error) {
      console.error('Error fetching history:', error);
      return {
        success: false,
        symbol,
        range,
        count: 0,
        candles: [],
      };
    }
  },

  /**
   * Get analyst recommendations
   */
  async getRecommendations(symbol: string): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${API_URL}/stock/${symbol}/recommendations`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch recommendations');
      }

      // Normalize response - handle different response structures
      const data = result?.data ?? result;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.recommendations)) return data.recommendations;
      return [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  },

  /**
   * Get EPS / earnings surprises
   */
  async getEPS(symbol: string): Promise<EarningsSurprise[]> {
    try {
      const response = await fetch(`${API_URL}/stock/${symbol}/eps`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch EPS');
      }

      // Normalize response
      const data = result?.data ?? result;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.earnings)) return data.earnings;
      return [];
    } catch (error) {
      console.error('Error fetching EPS:', error);
      return [];
    }
  },

  /**
   * Get earnings calendar
   */
  async getEarningsCalendar(symbol: string): Promise<EarningsCalendar[]> {
    try {
      const response = await fetch(`${API_URL}/stock/${symbol}/earnings-calendar`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch earnings calendar');
      }

      // Normalize response
      const data = result?.data ?? result;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.earningsCalendar)) return data.earningsCalendar;
      return [];
    } catch (error) {
      console.error('Error fetching earnings calendar:', error);
      return [];
    }
  },
};