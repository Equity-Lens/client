import React, { useState, useEffect } from 'react';
import '../../styles/pages/_earnings.scss';

// Types and Interfaces
interface EarningsItem {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: 'bmo' | 'amc' | 'dmh';
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
}

interface EarningsResponse {
  success: boolean;
  data: {
    earningsCalendar: EarningsItem[];
  };
}

interface DateRange {
  from: string;
  to: string;
}

interface BeatMissResult {
  diff: number;
  percent: string;
}

type TimingFilter = 'all' | 'bmo' | 'amc' | 'dmh';

const EarningsCalendar: React.FC = () => {
  const [earningsData, setEarningsData] = useState<EarningsItem[]>([]);
  const [filteredData, setFilteredData] = useState<EarningsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [searchSymbol, setSearchSymbol] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<TimingFilter>('all');
  const [includeInternational, setIncludeInternational] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchEarningsData();
  }, [dateRange, includeInternational]);

  useEffect(() => {
    applyFilters();
  }, [earningsData, searchSymbol, selectedHour]);

  const fetchEarningsData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: dateRange.from,
        to: dateRange.to,
        international: includeInternational.toString()
      });

      const API_BASE_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3001/v1";

      const response = await fetch(`${API_BASE_URL}/v1/calendar/earnings?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch earnings data');
      }

      const data: EarningsResponse = await response.json();
      setEarningsData(data.data.earningsCalendar || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setEarningsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (): void => {
    let filtered = [...earningsData];

    // Filter by symbol
    if (searchSymbol) {
      filtered = filtered.filter(item =>
        item.symbol.toLowerCase().includes(searchSymbol.toLowerCase())
      );
    }

    // Filter by hour
    if (selectedHour !== 'all') {
      filtered = filtered.filter(item => item.hour === selectedHour);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const formatCurrency = (value: number | null): string => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatEPS = (value: number | null): string => {
    if (value === null || value === undefined) return 'N/A';
    return `$${value.toFixed(2)}`;
  };

  const calculateBeatMiss = (actual: number | null, estimate: number | null): BeatMissResult | null => {
    if (!actual || !estimate) return null;
    const diff = actual - estimate;
    const percent = ((diff / estimate) * 100).toFixed(2);
    return { diff, percent };
  };

  const getHourLabel = (hour: string): string => {
    const labels: Record<string, string> = {
      'bmo': 'Before Market Open',
      'amc': 'After Market Close',
      'dmh': 'During Market Hours'
    };
    return labels[hour] || hour;
  };

  const getHourBadgeClass = (hour: string): string => {
    const classes: Record<string, string> = {
      'bmo': 'earnings-calendar__badge--morning',
      'amc': 'earnings-calendar__badge--evening',
      'dmh': 'earnings-calendar__badge--during'
    };
    return classes[hour] || '';
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleDateChange = (field: keyof DateRange) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDateRange(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleRefresh = (): void => {
    fetchEarningsData();
  };

  return (
    <div className="earnings-calendar">

      <div className="earnings-calendar__filters">
        <div className="filter-group">
          <label htmlFor="symbol-search">Search Symbol</label>
          <input
            id="symbol-search"
            type="text"
            placeholder="e.g., AAPL, MSFT"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="date-from">From Date</label>
          <input
            id="date-from"
            type="date"
            value={dateRange.from}
            onChange={handleDateChange('from')}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="date-to">To Date</label>
          <input
            id="date-to"
            type="date"
            value={dateRange.to}
            onChange={handleDateChange('to')}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="hour-filter">Timing</label>
          <select
            id="hour-filter"
            value={selectedHour}
            onChange={(e) => setSelectedHour(e.target.value as TimingFilter)}
            className="filter-select"
          >
            <option value="all">All Times</option>
            <option value="bmo">Before Market Open</option>
            <option value="amc">After Market Close</option>
            <option value="dmh">During Market Hours</option>
          </select>
        </div>

        <div className="filter-group filter-group--checkbox">
          <label>
            <input
              type="checkbox"
              checked={includeInternational}
              onChange={(e) => setIncludeInternational(e.target.checked)}
            />
            <span>Include International Markets</span>
          </label>
        </div>

        <button onClick={handleRefresh} className="filter-refresh" aria-label="Refresh earnings data">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 2V8M21 8H15M21 8L18 5.29C16.58 3.9 14.85 3 13 3C8.03 3 4 7.03 4 12C4 16.97 8.03 21 13 21C16.84 21 20 18.24 20.66 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="earnings-calendar__loading">
          <div className="loading-spinner"></div>
          <p>Loading earnings data...</p>
        </div>
      ) : error ? (
        <div className="earnings-calendar__error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>{error}</p>
          <button onClick={fetchEarningsData}>Try Again</button>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="earnings-calendar__empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No earnings data found for the selected filters</p>
        </div>
      ) : (
        <>
          <div className="earnings-calendar__table-container">
            <table className="earnings-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symbol</th>
                  <th>Period</th>
                  <th>Timing</th>
                  <th className="text-right">EPS Est.</th>
                  <th className="text-right">EPS Act.</th>
                  <th className="text-right">EPS Beat/Miss</th>
                  <th className="text-right">Rev. Est.</th>
                  <th className="text-right">Rev. Act.</th>
                  <th className="text-right">Rev. Beat/Miss</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => {
                  const epsBeatMiss = calculateBeatMiss(item.epsActual, item.epsEstimate);
                  const revBeatMiss = calculateBeatMiss(item.revenueActual, item.revenueEstimate);

                  return (
                    <tr key={`${item.symbol}-${item.date}-${index}`}>
                      <td className="earnings-table__date">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="earnings-table__symbol">
                        <span className="symbol-badge">{item.symbol}</span>
                      </td>
                      <td>Q{item.quarter} {item.year}</td>
                      <td>
                        <span className={`earnings-calendar__badge ${getHourBadgeClass(item.hour)}`}>
                          {getHourLabel(item.hour)}
                        </span>
                      </td>
                      <td className="text-right">{formatEPS(item.epsEstimate)}</td>
                      <td className="text-right earnings-table__actual">
                        {formatEPS(item.epsActual)}
                      </td>
                      <td className="text-right">
                        {epsBeatMiss && (
                          <span className={`beat-miss ${parseFloat(epsBeatMiss.percent) >= 0 ? 'beat-miss--positive' : 'beat-miss--negative'}`}>
                            {parseFloat(epsBeatMiss.percent) >= 0 ? '+' : ''}{epsBeatMiss.percent}%
                          </span>
                        )}
                      </td>
                      <td className="text-right">{formatCurrency(item.revenueEstimate)}</td>
                      <td className="text-right earnings-table__actual">
                        {formatCurrency(item.revenueActual)}
                      </td>
                      <td className="text-right">
                        {revBeatMiss && (
                          <span className={`beat-miss ${parseFloat(revBeatMiss.percent) >= 0 ? 'beat-miss--positive' : 'beat-miss--negative'}`}>
                            {parseFloat(revBeatMiss.percent) >= 0 ? '+' : ''}{revBeatMiss.percent}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="earnings-calendar__pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
                aria-label="Previous page"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages} 
                <span className="pagination-separator">•</span>
                {filteredData.length} results
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EarningsCalendar;