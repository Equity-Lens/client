import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { EarningsSurprise } from '../../../services/stockService';
import '../../../styles/components/_epsdetails.scss';

interface EPSDetailsProps {
  eps: EarningsSurprise[];
}

const EPSDetails: React.FC<EPSDetailsProps> = ({ eps }) => {
  // Safely handle the data - ensure it's an array
  const list = Array.isArray(eps) ? eps : [];

  if (list.length === 0) {
    return (
      <div className="eps-details card">
        <h3>EPS History</h3>
        <p className="no-data">No EPS data available</p>
      </div>
    );
  }

  // Get last 4 quarters
  const recentEPS = list.slice(0, 4);

  return (
    <div className="eps-details card">
      <h3>EPS History</h3>

      <div className="eps-table">
        <div className="table-header">
          <span>Quarter</span>
          <span>Actual</span>
          <span>Estimate</span>
          <span>Surprise</span>
        </div>

        {recentEPS.map((item, index) => {
          const actual = item.actual ?? 0;
          const estimate = item.estimate ?? 0;
          const surprise = item.surprise ?? 0;
          const surprisePercent = item.surprisePercent ?? 0;
          const isBeat = surprise > 0;
          
          return (
            <div key={index} className="table-row">
              <span className="quarter">
                Q{item.quarter ?? '-'} {item.year ?? '-'}
              </span>
              <span className="actual">${actual.toFixed(2)}</span>
              <span className="estimate">${estimate.toFixed(2)}</span>
              <span className={`surprise ${isBeat ? 'positive' : 'negative'}`}>
                {isBeat ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isBeat ? '+' : ''}{surprisePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EPSDetails;