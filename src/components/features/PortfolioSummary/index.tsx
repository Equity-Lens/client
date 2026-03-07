import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Briefcase, Plus } from 'lucide-react';
import type { PortfolioSummary as PortfolioSummaryType } from '../../../types/portfolio.types';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType | null;
  portfolioName?: string;
  loading?: boolean;
  onAddStock?: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return formatCurrency(value);
};

interface SummaryCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subValue,
  icon,
  trend = 'neutral',
  loading,
}) => {
  const getTrendClass = () => {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return '';
  };

  if (loading) {
    return (
      <div className="summary-card loading">
        <div className="summary-card-icon">{icon}</div>
        <div className="summary-card-content">
          <span className="summary-card-title">{title}</span>
          <div className="skeleton skeleton-value" />
          <div className="skeleton skeleton-subvalue" />
        </div>
      </div>
    );
  }

  return (
    <div className={`summary-card ${getTrendClass()}`}>
      <div className="summary-card-icon">{icon}</div>
      <div className="summary-card-content">
        <span className="summary-card-title">{title}</span>
        <span className={`summary-card-value ${getTrendClass()}`}>{value}</span>
        {subValue && (
          <span className={`summary-card-subvalue ${getTrendClass()}`}>{subValue}</span>
        )}
      </div>
    </div>
  );
};

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  summary,
  portfolioName,
  loading,
  onAddStock,
}) => {
  // Determine trends
  const totalPnLTrend = summary
    ? summary.totalPnL >= 0
      ? 'up'
      : 'down'
    : 'neutral';

  const todayPnLTrend = summary
    ? summary.todayPnL >= 0
      ? 'up'
      : 'down'
    : 'neutral';

  return (
    <div className="portfolio-summary">
      {/* Portfolio Header with Name and Add Stock Button */}
      {portfolioName && (
        <div className="portfolio-summary-header">
          <div className="portfolio-title">
            <Briefcase className="icon" size={20} />
            <h3>{portfolioName}</h3>
          </div>
          {onAddStock && (
            <button className="btn-primary" onClick={onAddStock}>
              <Plus size={18} />
              Add Stock
            </button>
          )}
        </div>
      )}

      <div className="summary-cards">
        {/* Total Value */}
        <SummaryCard
          title="Total Value"
          value={summary ? formatCompactCurrency(summary.totalValue) : '$0.00'}
          icon={<DollarSign size={24} />}
          loading={loading}
        />

        {/* Total Invested */}
        <SummaryCard
          title="Total Invested"
          value={summary ? formatCompactCurrency(summary.totalInvested) : '$0.00'}
          icon={<PieChart size={24} />}
          loading={loading}
        />

        {/* Total P&L */}
        <SummaryCard
          title="Total P&L"
          value={summary ? formatCurrency(summary.totalPnL) : '$0.00'}
          subValue={summary ? formatPercent(summary.totalPnLPercent) : '+0.00%'}
          icon={
            totalPnLTrend === 'up' ? (
              <TrendingUp size={24} />
            ) : totalPnLTrend === 'down' ? (
              <TrendingDown size={24} />
            ) : (
              <BarChart3 size={24} />
            )
          }
          trend={totalPnLTrend}
          loading={loading}
        />

        {/* Today's P&L */}
        <SummaryCard
          title="Today's P&L"
          value={summary ? formatCurrency(summary.todayPnL) : '$0.00'}
          subValue={summary ? formatPercent(summary.todayPnLPercent) : '+0.00%'}
          icon={
            todayPnLTrend === 'up' ? (
              <TrendingUp size={24} />
            ) : todayPnLTrend === 'down' ? (
              <TrendingDown size={24} />
            ) : (
              <BarChart3 size={24} />
            )
          }
          trend={todayPnLTrend}
          loading={loading}
        />

        {/* Holdings Count */}
        <SummaryCard
          title="Holdings"
          value={summary ? `${summary.holdingsCount} Stock${summary.holdingsCount !== 1 ? 's' : ''}` : '0 Stocks'}
          icon={<Briefcase size={24} />}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default PortfolioSummary;