import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import type { PriceCandle, Recommendation, EarningsSurprise, EarningsCalendar } from '../../services/stockService';
import { stockService } from '../../services/stockService'
import StockChart from '../../components/features/StockChart/index';
import RecommendationTrends from '../../components/features//RecommendationTrends/index';
import EPSDetails from '../../components/features/EPSDetails/index';
import EarningsCalendarCard from '../../components/features/EarningsCalendar/index';
import '../../styles/pages/_stockdetail.scss';

type RangeOption = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y';

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<RangeOption>('1mo');

  // Data
  const [candles, setCandles] = useState<PriceCandle[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [eps, setEps] = useState<EarningsSurprise[]>([]);
  const [earningsCalendar, setEarningsCalendar] = useState<EarningsCalendar[]>([]);

  // Derived values
  const latestPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;
  const previousPrice = candles.length > 1 ? candles[candles.length - 2].close : latestPrice;
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Fetch chart data when range changes
  useEffect(() => {
    if (!symbol) return;

    const fetchChartData = async () => {
      try {
        const historyData = await stockService.getHistory(symbol, selectedRange);
        setCandles(historyData.candles);
      } catch (err: any) {
        console.error('Error fetching chart:', err);
      }
    };

    fetchChartData();
  }, [symbol, selectedRange]);

  // Fetch all data on mount
  useEffect(() => {
    if (!symbol) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [historyData, recsData, epsData, calendarData] = await Promise.all([
          stockService.getHistory(symbol, selectedRange),
          stockService.getRecommendations(symbol),
          stockService.getEPS(symbol),
          stockService.getEarningsCalendar(symbol),
        ]);

        setCandles(historyData.candles);
        setRecommendations(recsData);
        setEps(epsData);
        setEarningsCalendar(calendarData);
      } catch (err: any) {
        setError(err.message || 'Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [symbol]);

  const rangeOptions: { value: RangeOption; label: string }[] = [
    { value: '1d', label: '1D' },
    { value: '5d', label: '5D' },
    { value: '1mo', label: '1M' },
    { value: '3mo', label: '3M' },
    { value: '6mo', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: '2y', label: '2Y' },
  ];

  if (loading) {
    return (
      <div className="stock-detail-loading">
        <Loader2 className="spinner" size={48} />
        <p>Loading {symbol} data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="stock-detail">
      {/* Back Button */}
      {/* <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button> */}

      {/* Stock Header */}
      <div className="stock-header">
        <div className="stock-info">
          <h1 className="symbol">{symbol}</h1>
          <div className="price-section">
            <span className="current-price">${latestPrice.toFixed(2)}</span>
            <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Price Chart</h2>
          <div className="range-selector">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                className={`range-btn ${selectedRange === option.value ? 'active' : ''}`}
                onClick={() => setSelectedRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <StockChart candles={candles} symbol={symbol || ''} />
      </div>

      {/* Data Grid */}
      <div className="data-grid">
        {/* Recommendations */}
        <RecommendationTrends recommendations={recommendations} />

        {/* EPS Details */}
        <EPSDetails eps={eps} />

        {/* Earnings Calendar */}
        <EarningsCalendarCard earnings={earningsCalendar} />
      </div>
    </div>
  );
};

export default StockDetail;