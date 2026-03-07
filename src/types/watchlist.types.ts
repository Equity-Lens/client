// Watchlist stock with full data from backend
export interface WatchlistStock {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  addedAt: Date;
  notes?: string;
  alertPrice?: number;
}

// Real-time price update from WebSocket
export interface PriceUpdate {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

// Watchlist item from database (before enrichment)
export interface WatchlistItem {
  id: number;
  user_id: number;
  symbol: string;
  notes?: string;
  alert_price?: number;
  added_at: string;
}

// Socket connection status
export interface SocketStatus {
  connected: boolean;
  socketId?: string;
  subscribedSymbols: string[];
}

// API response for watchlist
export interface WatchlistResponse {
  success: boolean;
  data?: {
    watchlist: WatchlistStock[];
  };
  message?: string;
}

// API response for adding stock
export interface AddStockResponse {
  success: boolean;
  message: string;
  data?: {
    item: WatchlistStock;
  };
}