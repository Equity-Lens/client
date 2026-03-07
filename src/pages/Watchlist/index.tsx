import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, RefreshCw, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import '../../styles/pages/_watchlist.scss';
import { watchlistService } from '../../services/watchlistService';
import { socketService } from '../../services/socketService';
import { useStockPrices } from '../../hooks/useStockPrices';
import type { WatchlistStock } from '../../types/watchlist.types';

const Watchlist: React.FC = () => {
  // State
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [addSymbol, setAddSymbol] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [addingStock, setAddingStock] = useState(false);

  // Use custom hook for real-time price updates
  useStockPrices({ stocks, setStocks });

  // Monitor socket connection status
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    socketService.onConnectionChange(handleConnectionChange);

    return () => {
      socketService.offConnectionChange(handleConnectionChange);
    };
  }, []);

  // Fetch watchlist on mount
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Fetch watchlist from backend (full data via REST)
  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const watchlistItems = await watchlistService.getWatchlist();
      console.log('📋 Watchlist items:', watchlistItems);

      // Map API response to WatchlistStock type
      const stocksData: WatchlistStock[] = watchlistItems.map((item: any) => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent,
        high: item.high,
        low: item.low,
        open: item.open,
        previousClose: item.previousClose,
        volume: item.volume,
        marketCap: item.marketCap,
        addedAt: new Date(item.addedAt),
        notes: item.notes,
        alertPrice: item.alertPrice,
      }));

      setStocks(stocksData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load watchlist';
      setError(message);
      console.error('❌ Fetch watchlist error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

const handleAddStock = async (e: React.FormEvent) => {
  e.preventDefault();

  const symbol = addSymbol.trim().toUpperCase();
  if (!symbol) return;

  // Check if already in watchlist
  if (stocks.some((s) => s.symbol === symbol)) {
    alert(`${symbol} is already in your watchlist`);
    return;
  }

  try {
    setAddingStock(true);
    
    // addStock already returns the item directly (result.data.item from service)
    const item = await watchlistService.addStock(symbol);

    console.log('📦 Add stock result:', item); // DEBUG

    if (item && item.symbol) {
      const newStock: WatchlistStock = {
        id: item.id,
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: item.price || 0,
        change: item.change || 0,
        changePercent: item.changePercent || 0,
        high: item.high || 0,
        low: item.low || 0,
        open: item.open || 0,
        previousClose: item.previousClose || 0,
        volume: item.volume || 0,
        marketCap: item.marketCap || 0,
        addedAt: new Date(),
        notes: item.notes,
        alertPrice: item.alertPrice,
      };

      // Add to state - prepend to show at top
      setStocks((prev) => [newStock, ...prev]);
      console.log(`✅ Added ${symbol} to watchlist`);
    } else {
      console.error('❌ Invalid item returned:', item);
      // Fallback: refresh the entire list
      await fetchWatchlist();
    }

    // Reset form
    setAddSymbol('');
    setShowAddForm(false);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add stock';
    alert(message);
    console.error('❌ Add stock error:', err);
  } finally {
    setAddingStock(false);
  }
};

  // Remove stock from watchlist
  const handleRemoveStock = async (symbol: string) => {
    if (!window.confirm(`Remove ${symbol} from watchlist?`)) return;

    try {
      await watchlistService.removeStock(symbol);
      setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
      console.log(`✅ Removed ${symbol} from watchlist`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove stock';
      alert(message);
      console.error('❌ Remove stock error:', err);
    }
  };

  // Format large numbers (volume, market cap)
  const formatNumber = (num: number): string => {
    if (!num || num === 0) return '-';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  // Format price with 2 decimal places
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="page">
        <div className="watchlist-loading">
          <div className="spinner"></div>
          <p>Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-actions">

          {/* Add Stock Button */}
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn-primary"
          >
            <Plus className="icon" />
            Add Stock
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')} className="alert-close">×</button>
          </div>
        )}

        {/* Add Stock Form */}
        {showAddForm && (
          <div className="add-stock-form">
            <form onSubmit={handleAddStock}>
              <div className="form-input-group">
                <label htmlFor="stock-symbol">Stock Symbol</label>
                <input
                  id="stock-symbol"
                  type="text"
                  value={addSymbol}
                  onChange={(e) => setAddSymbol(e.target.value.toUpperCase())}
                  placeholder="Type symbol (e.g., AAPL, TSLA, MSFT)"
                  className="form-input-large"
                  autoFocus
                  disabled={addingStock}
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={!addSymbol.trim() || addingStock}
                >
                  {addingStock ? 'Adding...' : 'Add to Watchlist'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddSymbol('');
                  }}
                  className="btn-cancel"
                  disabled={addingStock}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty State */}
        {stocks.length === 0 ? (
          <div className="watchlist-empty">
            <TrendingUp className="empty-icon" />
            <h3>Your Watchlist is Empty</h3>
            <p>Start tracking stocks by clicking "Add Stock"</p>
          </div>
        ) : (
          /* Watchlist Table */
          <div className="watchlist-table-container">
            <table className="watchlist-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Change</th>
                  <th className="text-right">Change %</th>
                  <th className="text-right">Volume</th>
                  <th className="text-right">Market Cap</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.symbol}>
                    <td className="stock-symbol">
                      <span className="symbol-badge">{stock.symbol}</span>
                    </td>
                    <td className="stock-name">{stock.name}</td>
                    <td className="stock-price text-right">
                      {formatPrice(stock.price)}
                    </td>
                    <td
                      className={`watchlist-change text-right ${
                        stock.change >= 0 ? 'positive' : 'negative'
                      }`}
                    >
                      <div className="change-badge">
                        {stock.change >= 0 ? '▲' : '▼'}{' '}
                        {stock.change >= 0 ? '+' : '-'}$
                        {Math.abs(stock.change).toFixed(2)}
                      </div>
                    </td>
                    <td
                      className={`watchlist-change-percent text-right ${
                        stock.changePercent >= 0 ? 'positive' : 'negative'
                      }`}
                    >
                      <div className="change-badge">
                        {stock.changePercent >= 0 ? '▲' : '▼'}{' '}
                        {stock.changePercent >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="stock-volume text-right">
                      {formatNumber(stock.volume)}
                    </td>
                    <td className="stock-market-cap text-right">
                      {formatNumber(stock.marketCap)}
                    </td>
                    <td className="stock-actions text-center">
                      <button
                        onClick={() => handleRemoveStock(stock.symbol)}
                        className="btn-action btn-action-danger"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="action-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="watchlist-footer">
          <p className="stock-count">
            {stocks.length} stock{stocks.length !== 1 ? 's' : ''} in watchlist
          </p>
        </div>
      </div>
    </div>
  );
};

export default Watchlist;