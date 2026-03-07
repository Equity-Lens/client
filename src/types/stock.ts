// Stock data structure
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume?: number;
  timestamp?: number;
}

// Search state
export interface SearchState {
  query: string;
  results: Stock[];
  loading: boolean;
  error: string | null;
}

// WebSocket message types
export interface WebSocketTradeMessage {
  type: 'trade';
  data: TradeData[];
}

export interface TradeData {
  s: string;  // Symbol
  p: number;  // Price
  t: number;  // Timestamp
  v: number;  // Volume
  c?: string[]; // Conditions
}

// Finnhub Search API response
export interface FinnhubSearchResult {
  count: number;
  result: FinnhubSymbol[];
}

export interface FinnhubSymbol {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

// WebSocket subscription message
export interface WebSocketSubscription {
  type: 'subscribe' | 'unsubscribe';
  symbol: string;
}