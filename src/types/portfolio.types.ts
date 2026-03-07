export interface Portfolio {
  id: number;
  user_id: number;
  name: string;
  broker: string | null;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  holdingsCount?: number;
}

export interface CreatePortfolioData {
  name: string;
  broker?: string;
  description?: string;
  is_default?: boolean;
}

export interface PortfolioHolding {
  id: number;
  portfolioId: number;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  previousClose: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayPnL: number;
  dayPnLPercent: number;
  marketCap: number;
  notes: string | null;
  addedAt: string;
}

export interface CreateHoldingData {
  symbol: string;
  quantity: number;
  avg_buy_price: number;
  notes?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  todayPnL: number;
  todayPnLPercent: number;
  holdingsCount: number;
}

export type AlertType = 'price_above' | 'price_below' | 'percent_up' | 'percent_down';

export interface PriceAlert {
  id: number;
  user_id: number;
  symbol: string;
  alert_type: AlertType;
  target_value: number;
  base_price: number | null;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
  description?: string;
  targetPrice?: number;
}

export interface CreateAlertData {
  symbol: string;
  alert_type: AlertType;
  target_value: number;
}

export interface AlertSummary {
  total: number;
  active: number;
  triggered: number;
}

export interface PortfolioListResponse {
  success: boolean;
  data?: {
    portfolios: Portfolio[];
  };
  message?: string;
}

export interface PortfolioResponse {
  success: boolean;
  data?: {
    portfolio: Portfolio;
  };
  message?: string;
}

export interface HoldingsResponse {
  success: boolean;
  data?: {
    holdings: PortfolioHolding[];
    summary: PortfolioSummary;
  };
  message?: string;
}

export interface HoldingResponse {
  success: boolean;
  data?: {
    holding: PortfolioHolding;
  };
  message?: string;
}

export interface AlertListResponse {
  success: boolean;
  data?: {
    alerts: PriceAlert[];
  };
  message?: string;
}

export interface AlertResponse {
  success: boolean;
  data?: {
    alert: PriceAlert;
  };
  message?: string;
}

export interface AlertSummaryResponse {
  success: boolean;
  data?: {
    summary: AlertSummary;
  };
  message?: string;
}

export interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  holdings: PortfolioHolding[];
  summary: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
}

export interface AlertModalState {
  isOpen: boolean;
  symbol: string;
  currentPrice: number;
}

export interface AddHoldingModalState {
  isOpen: boolean;
  portfolioId: number | null;
}

export interface CreatePortfolioModalState {
  isOpen: boolean;
  editPortfolio: Portfolio | null;
}