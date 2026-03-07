import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { EarningsCalendar } from '../../../services/stockService';
import '../../../styles/components/_earningscalendar.scss';

interface EarningsCalendarCardProps {
  earnings: EarningsCalendar[];
}

const EarningsCalendarCard: React.FC<EarningsCalendarCardProps> = ({ earnings }) => {
  // Safely handle the data - ensure it's an array
  const list = Array.isArray(earnings) ? earnings : [];
  const nextEarnings = list[0];

  if (!nextEarnings) {
    return (
      <div className="earnings-calendar card">
        <h3>Upcoming Earnings</h3>
        <p className="no-data">No upcoming earnings</p>
      </div>
    );
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'TBD';
    }
  };

  const formatHour = (hour: string | null | undefined) => {
    if (!hour) return 'Time TBD';
    switch (hour) {
      case 'bmo': return 'Before Market Open';
      case 'amc': return 'After Market Close';
      default: return hour;
    }
  };

  const formatRevenue = (value: number | null | undefined) => {
    if (value == null) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const epsEstimate = nextEarnings.epsEstimate ?? 0;
  const revenueEstimate = nextEarnings.revenueEstimate ?? 0;

  return (
    <div className="earnings-calendar card">
      <h3>Upcoming Earnings</h3>

      <div className="next-earnings">
        <div className="date-info">
          <Calendar size={20} />
          <span className="date">{formatDate(nextEarnings.date)}</span>
        </div>

        <div className="time-info">
          <Clock size={16} />
          <span>{formatHour(nextEarnings.hour)}</span>
        </div>

        <div className="quarter-info">
          Q{nextEarnings.quarter ?? '-'} {nextEarnings.year ?? '-'}
        </div>
      </div>

      <div className="estimates">
        <div className="estimate-item">
          <span className="label">EPS Estimate</span>
          <span className="value">${epsEstimate.toFixed(2)}</span>
        </div>
        <div className="estimate-item">
          <span className="label">Revenue Estimate</span>
          <span className="value">{formatRevenue(revenueEstimate)}</span>
        </div>
      </div>
    </div>
  );
};

export default EarningsCalendarCard;