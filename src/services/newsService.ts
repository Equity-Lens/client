import type { NewsArticle, NewsCategory } from '../types/news.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const newsService = {
  // Get general market news
  async getMarketNews(category: NewsCategory = 'general'): Promise<NewsArticle[]> {
    const response = await fetch(`${API_URL}/news/market?category=${category}`, {
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch market news');
    }

    return result.data;
  },

  // Get company-specific news
  async getCompanyNews(
    symbol: string,
    fromDate?: string,
    toDate?: string
  ): Promise<NewsArticle[]> {
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);

    const queryString = params.toString();
    const url = `${API_URL}/news/company/${symbol}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Failed to fetch news for ${symbol}`);
    }

    return result.data;
  },
};

export default newsService;