export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  imageUrl: string;
  articleUrl: string;
  publishedAt: string;
  relatedSymbols: string[];
  category: string;
  timeAgo: string;
}

export interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  count: number;
}

export interface CompanyNewsResponse extends NewsResponse {
  symbol: string;
}

export type NewsCategory = 'general' | 'forex' | 'crypto' | 'merger';