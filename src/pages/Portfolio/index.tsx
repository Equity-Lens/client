import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Bell,
  TrendingUp,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

// Components
import PortfolioTabs from '../../components/features/Portfolio/index';
import PortfolioSummary from '../../components/features/PortfolioSummary/index';
import AddHoldingModal from '../../components/features/AddHoldingModal/index';
import AlertModal from '../../components/features/AlertModal/index';

// Services
import { portfolioService } from '../../services/portfolioService';
import { alertService } from '../../services/alertService';
import { socketService } from '../../services/socketService';

// Hooks
import { useStockPrices } from '../../hooks/useStockPrices';

// Types
import type {
  Portfolio,
  PortfolioHolding,
  PortfolioSummary as PortfolioSummaryType,
  CreatePortfolioData,
  CreateHoldingData,
  CreateAlertData,
} from '../../types/portfolio.types';

// Styles
import '../../styles/pages/_portfolio.scss';

// Helper Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const formatCompactNumber = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return formatCurrency(value);
};

// Portfolio page component
const PortfolioPage: React.FC = () => {

  // Portfolio state
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Modal state
  const [showAddHoldingModal, setShowAddHoldingModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<PortfolioHolding | null>(null);

  // Convert holdings to stock format for useStockPrices hook
  const stocksForPriceUpdates = holdings.map((h) => ({
    id: h.id,
    symbol: h.symbol,
    name: h.name,
    price: h.currentPrice,
    change: h.dayChange,
    changePercent: h.dayPnLPercent,
    previousClose: h.previousClose,
    volume: 0,
    marketCap: h.marketCap,
    high: 0,
    low: 0,
    open: 0,
    addedAt: new Date(h.addedAt),
  }));

  // Use the stock prices hook for real-time updates
  useStockPrices({
    stocks: stocksForPriceUpdates,
    setStocks: (updater) => {
      if (typeof updater === 'function') {
        setHoldings((prevHoldings) => {
          const updatedStocks = updater(stocksForPriceUpdates);
          return prevHoldings.map((holding) => {
            const updatedStock = updatedStocks.find((s) => s.symbol === holding.symbol);
            if (updatedStock) {
              const currentPrice = updatedStock.price;
              const currentValue = holding.quantity * currentPrice;
              const pnl = currentValue - holding.investedValue;
              const pnlPercent = holding.investedValue > 0 ? (pnl / holding.investedValue) * 100 : 0;
              const dayChange = currentPrice - holding.previousClose;
              const dayPnL = holding.quantity * dayChange;
              const dayPnLPercent = holding.previousClose > 0 ? (dayChange / holding.previousClose) * 100 : 0;

              return {
                ...holding,
                currentPrice,
                currentValue,
                pnl,
                pnlPercent,
                dayChange,
                dayPnL,
                dayPnLPercent,
              };
            }
            return holding;
          });
        });
      }
    },
  });

  // Monitor socket connection status
  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      
      // Auto-reconnect: refetch data when connection is restored
      if (connected && activePortfolio && !holdingsLoading) {
        fetchHoldings(activePortfolio.id);
      }
    };

    socketService.onConnectionChange(handleConnectionChange);
    
    // Check initial connection status
    setIsConnected(socketService.isConnected());
    
    return () => {
      socketService.offConnectionChange(handleConnectionChange);
    };
  }, [activePortfolio]);

  // Recalculate summary when holdings change (real-time)
  useEffect(() => {
    if (holdings.length > 0) {
      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
      const totalPnL = totalValue - totalInvested;
      const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
      const todayPnL = holdings.reduce((sum, h) => sum + h.dayPnL, 0);
      const todayPnLPercent = totalValue > 0 ? (todayPnL / (totalValue - todayPnL)) * 100 : 0;

      setSummary({
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercent,
        todayPnL,
        todayPnLPercent,
        holdingsCount: holdings.length,
      });
    } else {
      setSummary(null);
    }
  }, [holdings]);

  // Fetch portfolios
  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await portfolioService.getPortfolios();
      setPortfolios(data);

      // Set active portfolio (default or first)
      if (data.length > 0) {
        const defaultPortfolio = data.find((p) => p.is_default) || data[0];
        setActivePortfolio(defaultPortfolio);
      } else {
        setActivePortfolio(null);
        setHoldings([]);
        setSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolios');
      console.error('Fetch portfolios error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch holdings for active portfolio
  const fetchHoldings = useCallback(async (portfolioId: number) => {
    try {
      setHoldingsLoading(true);
      setError(null);

      const { holdings: data, summary: summaryData } = await portfolioService.getHoldings(portfolioId);
      setHoldings(data);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load holdings');
      console.error('Fetch holdings error:', err);
    } finally {
      setHoldingsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Fetch holdings when active portfolio changes
  useEffect(() => {
    if (activePortfolio) {
      fetchHoldings(activePortfolio.id);
    }
  }, [activePortfolio, fetchHoldings]);

// Portfolio Handlers
  const handleSelectPortfolio = (portfolioId: number) => {
    const portfolio = portfolios.find((p) => p.id === portfolioId);
    if (portfolio) {
      setActivePortfolio(portfolio);
    }
  };

  const handleCreatePortfolio = async (data: CreatePortfolioData) => {
    const newPortfolio = await portfolioService.createPortfolio(data);
    setPortfolios((prev) => [...prev, newPortfolio]);

    // If it's the first portfolio or set as default, make it active
    if (portfolios.length === 0 || data.is_default) {
      setActivePortfolio(newPortfolio);
    }
  };

  const handleUpdatePortfolio = async (portfolioId: number, data: Partial<CreatePortfolioData>) => {
    const updatedPortfolio = await portfolioService.updatePortfolio(portfolioId, data);
    setPortfolios((prev) =>
      prev.map((p) => (p.id === portfolioId ? updatedPortfolio : p))
    );

    if (activePortfolio?.id === portfolioId) {
      setActivePortfolio(updatedPortfolio);
    }
  };

  const handleDeletePortfolio = async (portfolioId: number) => {
    await portfolioService.deletePortfolio(portfolioId);
    setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));

    // If deleted portfolio was active, switch to another
    if (activePortfolio?.id === portfolioId) {
      const remaining = portfolios.filter((p) => p.id !== portfolioId);
      if (remaining.length > 0) {
        const newActive = remaining.find((p) => p.is_default) || remaining[0];
        setActivePortfolio(newActive);
      } else {
        setActivePortfolio(null);
        setHoldings([]);
        setSummary(null);
      }
    }
  };

  const handleSetDefault = async (portfolioId: number) => {
    await portfolioService.setDefaultPortfolio(portfolioId);
    setPortfolios((prev) =>
      prev.map((p) => ({
        ...p,
        is_default: p.id === portfolioId,
      }))
    );
  };

// Holding Handlers
  const handleAddHolding = async (data: CreateHoldingData) => {
    if (!activePortfolio) return;

    const newHolding = await portfolioService.addHolding(activePortfolio.id, data);
    setHoldings((prev) => [newHolding, ...prev]);

    // Update portfolio holdings count
    setPortfolios((prev) =>
      prev.map((p) =>
        p.id === activePortfolio.id
          ? { ...p, holdingsCount: (p.holdingsCount || 0) + 1 }
          : p
      )
    );
  };

  const handleRemoveHolding = async (symbol: string) => {
    if (!activePortfolio) return;

    const holding = holdings.find((h) => h.symbol === symbol);
    if (!holding) return;

    const confirmMessage = `Remove ${symbol} from ${activePortfolio.name}? This will also delete any price alerts for this stock.`;
    if (!window.confirm(confirmMessage)) return;

    await portfolioService.removeHolding(activePortfolio.id, symbol);
    setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));

    // Update portfolio holdings count
    setPortfolios((prev) =>
      prev.map((p) =>
        p.id === activePortfolio.id
          ? { ...p, holdingsCount: Math.max((p.holdingsCount || 1) - 1, 0) }
          : p
      )
    );
  };

// Alert Handlers
  const handleOpenAlertModal = (holding: PortfolioHolding) => {
    setSelectedHolding(holding);
    setShowAlertModal(true);
  };

  const handleCreateAlert = async (data: CreateAlertData) => {
    await alertService.createAlert(data);
    // Optionally show a success toast/notification
  };

  // Loading state
  if (loading) {
    return (
      <div className="page">
        <div className="portfolio-loading">
          <div className="spinner" />
          <p>Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page portfolio-page">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Portfolio Tabs */}
      <PortfolioTabs
        portfolios={portfolios}
        activePortfolioId={activePortfolio?.id || null}
        onSelectPortfolio={handleSelectPortfolio}
        onCreatePortfolio={handleCreatePortfolio}
        onUpdatePortfolio={handleUpdatePortfolio}
        onDeletePortfolio={handleDeletePortfolio}
        onSetDefault={handleSetDefault}
        loading={holdingsLoading}
      />

      {/* Main Content */}
      <div className="page-content">
        {portfolios.length === 0 ? (
          // No Portfolios State
          <div className="portfolio-empty">
            <Briefcase className="empty-icon" size={64} />
            <h3>No Portfolios Yet</h3>
            <p>Create your first portfolio to start tracking your investments</p>
          </div>
        ) : activePortfolio ? (
          <>
            {/* Portfolio Summary */}
            <PortfolioSummary
              summary={summary}
              portfolioName={activePortfolio.name}
              loading={holdingsLoading}
              onAddStock={() => setShowAddHoldingModal(true)}
            />

            {/* Holdings Section */}
            <div className="holdings-section">
              <div className="holdings-header">
                <h2>Holdings</h2>
                {holdings.length > 0 && (
                  <span className="holdings-count">{holdings.length} stocks</span>
                )}
              </div>

              {holdingsLoading ? (
                <div className="holdings-loading">
                  <div className="spinner" />
                  <p>Loading holdings...</p>
                </div>
              ) : holdings.length === 0 ? (
                <div className="holdings-empty">
                  <TrendingUp className="empty-icon" size={48} />
                  <h3>No Holdings</h3>
                  <p>Add stocks to track your investments</p>
                  <button
                    className="btn-primary"
                    onClick={() => setShowAddHoldingModal(true)}
                  >
                    <Plus size={18} />
                    Add Your First Stock
                  </button>
                </div>
              ) : (
                <div className="holdings-table-container">
                  <table className="holdings-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Avg Price</th>
                        <th className="text-right">LTP</th>
                        <th className="text-right">P&L</th>
                        <th className="text-right">P&L %</th>
                        <th className="text-right">Market Cap</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => (
                        <tr key={holding.symbol}>
                          <td className="holding-symbol">
                            <span className="symbol-badge">{holding.symbol}</span>
                          </td>
                          <td className="holding-name">{holding.name}</td>
                          <td className="holding-quantity text-right">
                            {holding.quantity.toLocaleString()}
                          </td>
                          <td className="holding-avg-price text-right">
                            {formatCurrency(holding.avgBuyPrice)}
                          </td>
                          <td className="holding-ltp text-right">
                            <span className={`price-cell ${holding.dayChange >= 0 ? 'price-up' : 'price-down'}`}>
                              {formatCurrency(holding.currentPrice)}
                            </span>
                          </td>
                          <td
                            className={`holding-pnl text-right ${
                              holding.pnl >= 0 ? 'positive' : 'negative'
                            }`}
                          >
                            <div className="pnl-badge">
                              {holding.pnl >= 0 ? '▲' : '▼'}{' '}
                              {holding.pnl >= 0 ? '+' : '-'}
                              {formatCurrency(Math.abs(holding.pnl))}
                            </div>
                          </td>
                          <td
                            className={`holding-pnl-percent text-right ${
                              holding.pnlPercent >= 0 ? 'positive' : 'negative'
                            }`}
                          >
                            <div className="pnl-badge">
                              {holding.pnlPercent >= 0 ? '▲' : '▼'}{' '}
                              {formatPercent(holding.pnlPercent)}
                            </div>
                          </td>
                          <td className="holding-market-cap text-right">
                            {formatCompactNumber(holding.marketCap)}
                          </td>
                          <td className="holding-actions text-center">
                            <div className="action-buttons">
                              <button
                                className="btn-action btn-action-alert"
                                onClick={() => handleOpenAlertModal(holding)}
                                title="Set Price Alert"
                              >
                                <Bell size={16} />
                              </button>
                              <button
                                className="btn-action btn-action-danger"
                                onClick={() => handleRemoveHolding(holding.symbol)}
                                title="Remove from Portfolio"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="portfolio-footer">
              <p className="holdings-info">
                {holdings.length} stock{holdings.length !== 1 ? 's' : ''} in {activePortfolio.name}
              </p>
              {isConnected && (
                <div className="live-status connected">
                  <span className="live-dot" />
                  <span>Prices updating in real-time</span>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Add Holding Modal */}
      <AddHoldingModal
        isOpen={showAddHoldingModal}
        onClose={() => setShowAddHoldingModal(false)}
        onSubmit={handleAddHolding}
        portfolioName={activePortfolio?.name}
      />

      {/* Alert Modal */}
      {selectedHolding && (
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => {
            setShowAlertModal(false);
            setSelectedHolding(null);
          }}
          onSubmit={handleCreateAlert}
          symbol={selectedHolding.symbol}
          currentPrice={selectedHolding.currentPrice}
          stockName={selectedHolding.name}
        />
      )}
    </div>
  );
};

export default PortfolioPage;