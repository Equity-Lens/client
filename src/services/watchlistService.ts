const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const watchlistService = {
  // Get user's watchlist
  async getWatchlist(): Promise<any[]> {
    const response = await fetch(`${API_URL}/watchlist`, {
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get watchlist');
    }

    return result.data.watchlist;
  },

  // Add stock to watchlist
  async addStock(symbol: string, notes?: string, alertPrice?: number): Promise<any> {
    const response = await fetch(`${API_URL}/watchlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ symbol, notes, alertPrice }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add stock');
    }

    return result.data.item;
  },

  // Remove stock from watchlist
  async removeStock(symbol: string): Promise<void> {
    const response = await fetch(`${API_URL}/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to remove stock');
    }
  },

  // Update watchlist item
  async updateStock(symbol: string, notes?: string, alertPrice?: number): Promise<any> {
    const response = await fetch(`${API_URL}/watchlist/${symbol}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes, alertPrice }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update stock');
    }

    return result.data.item;
  },
};