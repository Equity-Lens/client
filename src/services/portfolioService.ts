import type {
  Portfolio,
  CreatePortfolioData,
  PortfolioHolding,
  CreateHoldingData,
  PortfolioSummary,
} from '../types/portfolio.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const handleResponse = async (response: Response): Promise<any> => {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }

  return result;
};

export const portfolioService = {

  // Get all portfolios for user
  async getPortfolios(): Promise<Portfolio[]> {
    const response = await fetch(`${API_URL}/portfolio`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.portfolios;
  },

  // Get single portfolio
  async getPortfolio(portfolioId: number): Promise<Portfolio> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.portfolio;
  },

  // Create new portfolio
  async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
    const response = await fetch(`${API_URL}/portfolio`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse(response);
    return result.data.portfolio;
  },

  // Update portfolio
  async updatePortfolio(portfolioId: number, data: Partial<CreatePortfolioData>): Promise<Portfolio> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse(response);
    return result.data.portfolio;
  },

  // Delete portfolio
  async deletePortfolio(portfolioId: number): Promise<void> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
  },

  // Set portfolio as default
  async setDefaultPortfolio(portfolioId: number): Promise<void> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/default`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
  },

  // Get portfolio holdings with live prices
  async getHoldings(portfolioId: number): Promise<{
    holdings: PortfolioHolding[];
    summary: PortfolioSummary;
  }> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/holdings`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return {
      holdings: result.data.holdings,
      summary: result.data.summary,
    };
  },

  // Add holding to portfolio
  async addHolding(portfolioId: number, data: CreateHoldingData): Promise<PortfolioHolding> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/holdings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse(response);
    return result.data.holding;
  },

  // Update holding
  async updateHolding(
    portfolioId: number,
    symbol: string,
    data: Partial<CreateHoldingData>
  ): Promise<PortfolioHolding> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/holdings/${symbol}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse(response);
    return result.data.holding;
  },

  // Remove holding from portfolio
  async removeHolding(portfolioId: number, symbol: string): Promise<void> {
    const response = await fetch(`${API_URL}/portfolio/${portfolioId}/holdings/${symbol}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
  },
};

export default portfolioService;