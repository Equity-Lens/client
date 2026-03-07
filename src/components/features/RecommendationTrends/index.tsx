import React from 'react';
import type { Recommendation } from '../../../services/stockService';
import '../../../styles/components/_recommendationtrends.scss';

interface RecommendationTrendsProps {
  recommendations: Recommendation[];
}

const RecommendationTrends: React.FC<RecommendationTrendsProps> = ({ recommendations }) => {
  // Safely handle the data - ensure it's an array
  const list = Array.isArray(recommendations) ? recommendations : [];
  const latest = list[0];

  // Check if we have valid data
  if (!latest) {
    return (
      <div className="recommendation-trends card">
        <h3>Analyst Recommendations</h3>
        <p className="no-data">No recommendations available</p>
      </div>
    );
  }

  const total = (latest.strongBuy || 0) + (latest.buy || 0) + (latest.hold || 0) + (latest.sell || 0) + (latest.strongSell || 0);

  // Prevent division by zero
  const getPercentage = (value: number) => {
    if (total === 0) return '0';
    return ((value / total) * 100).toFixed(1);
  };

  // Colors from design system
  const ratings = [
    { label: 'Strong Buy', value: latest.strongBuy || 0, color: '#10b981' },
    { label: 'Buy', value: latest.buy || 0, color: '#34d399' },
    { label: 'Hold', value: latest.hold || 0, color: '#f59e0b' },
    { label: 'Sell', value: latest.sell || 0, color: '#f87171' },
    { label: 'Strong Sell', value: latest.strongSell || 0, color: '#ef4444' },
  ];

  return (
    <div className="recommendation-trends card">
      <h3>Analyst Recommendations</h3>
      <p className="period">Period: {latest.period || 'N/A'}</p>

      {/* Bar visualization */}
      <div className="recommendation-bar">
        {ratings.map((rating) => (
          <div
            key={rating.label}
            className="bar-segment"
            style={{
              width: `${getPercentage(rating.value)}%`,
              backgroundColor: rating.color,
            }}
            title={`${rating.label}: ${rating.value}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="recommendation-legend">
        {ratings.map((rating) => (
          <div key={rating.label} className="legend-item">
            <span className="dot" style={{ backgroundColor: rating.color }} />
            <span className="label">{rating.label}</span>
            <span className="value">{rating.value}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="recommendation-summary">
        <span className="total">Total Analysts: {total}</span>
      </div>
    </div>
  );
};

export default RecommendationTrends;