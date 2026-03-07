import React, { useState, useEffect } from 'react';
import { newsService } from '../../../../services/newsService';
import type { NewsArticle, NewsCategory } from '../../../../types/news.types';
import '../../../../styles/components/_newsfeed.scss'
import { TrendingUp } from 'lucide-react';

interface NewsFeedProps {
  category?: NewsCategory;
  symbol?: string;
  maxItems?: number;
}

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    window.open(article.articleUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="news-card" onClick={handleClick}>
      {/* Image */}
      {article.imageUrl && !imageError ? (
        <div className="news-card__image">
          <img
            src={article.imageUrl}
            alt={article.title}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="news-card__image news-card__image--placeholder">
          <TrendingUp size={32} />
        </div>
      )}

      {/* Content */}
      <div className="news-card__content">
        {/* Source & Time */}
        <div className="news-card__meta">
          <span className="news-card__source">{article.source}</span>
          <span className="news-card__time">{article.timeAgo}</span>
        </div>

        {/* Title */}
        <h3 className="news-card__title">{article.title}</h3>
      </div>
    </article>
  );
};

const NewsFeed: React.FC<NewsFeedProps> = ({
  category = 'general',
  symbol,
  maxItems = 12,
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(category);

  const categories: { value: NewsCategory; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'merger', label: 'M&A' },
    { value: 'forex', label: 'Forex' },
    { value: 'crypto', label: 'Crypto' },
  ];

  // Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        let articles: NewsArticle[];

        if (symbol) {
          articles = await newsService.getCompanyNews(symbol);
        } else {
          articles = await newsService.getMarketNews(activeCategory);
        }

        setNews(articles.slice(0, maxItems));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeCategory, symbol, maxItems]);

  return (
    <section className="news-feed">
      {/* Header */}
      <div className="news-feed__header">
        <div className="news-feed__title">
          <TrendingUp size={20} />
          <h2>{symbol ? `${symbol} News` : 'Market News'}</h2>
        </div>

        {/* Category Tabs (only for market news) */}
        {!symbol && (
          <div className="news-feed__categories">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`category-tab ${activeCategory === cat.value ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="news-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="news-card-skeleton">
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-meta" />
                <div className="skeleton-title" />
                <div className="skeleton-title-2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="news-feed__error">
          <p>{error}</p>
          <button onClick={() => setActiveCategory(activeCategory)}>Try Again</button>
        </div>
      ) : news.length === 0 ? (
        <div className="news-feed__empty">
          <p>No news available at the moment.</p>
        </div>
      ) : (
        <div className="news-grid">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
};

export default NewsFeed;