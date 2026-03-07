import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Bell, Loader2 } from 'lucide-react';
import type { CreateAlertData } from '../../../types/portfolio.types';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlertData) => Promise<void>;
  symbol: string;
  stockName: string;
  currentPrice: number;
}

type AlertType = 'price_above' | 'price_below';

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  symbol,
  stockName,
  currentPrice,
}) => {
  // Form state
  const [alertType, setAlertType] = useState<AlertType>('price_above');
  const [targetPrice, setTargetPrice] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAlertType('price_above');
      setTargetPrice('');
      setError(null);
    }
  }, [isOpen]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = parseFloat(targetPrice);

    // Validation
    if (!targetPrice || target <= 0) {
      setError('Please enter a valid target price');
      return;
    }

    if (alertType === 'price_above' && target <= currentPrice) {
      setError('Target price must be higher than current price for "Price Goes Above" alert');
      return;
    }

    if (alertType === 'price_below' && target >= currentPrice) {
      setError('Target price must be lower than current price for "Price Goes Below" alert');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        symbol,
        alert_type: alertType,
        target_value: target,
        base_price: currentPrice,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal alert-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>Set Price Alert</h3>
            <span className="modal-subtitle">{symbol} • {stockName}</span>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Current Price Display */}
            <div className="current-price-display">
              <span className="label">Current Price</span>
              <span className="price">{formatCurrency(currentPrice)}</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {/* Alert Type Selection */}
            <div className="form-group">
              <label>Alert Type</label>
              <div className="alert-type-options">
                <button
                  type="button"
                  className={`alert-type-btn ${alertType === 'price_above' ? 'selected' : ''}`}
                  onClick={() => setAlertType('price_above')}
                >
                  <TrendingUp size={20} />
                  <span className="alert-type-label">Price Goes Above</span>
                </button>
                <button
                  type="button"
                  className={`alert-type-btn ${alertType === 'price_below' ? 'selected' : ''}`}
                  onClick={() => setAlertType('price_below')}
                >
                  <TrendingDown size={20} />
                  <span className="alert-type-label">Price Goes Below</span>
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div className="form-group">
              <label htmlFor="targetPrice">Target Price</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="targetPrice"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder={alertType === 'price_above' 
                    ? (currentPrice * 1.1).toFixed(2) 
                    : (currentPrice * 0.9).toFixed(2)
                  }
                  min="0.01"
                  step="0.01"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <span className="helper-text">
                {alertType === 'price_above' 
                  ? 'You\'ll be notified when the price rises above this value'
                  : 'You\'ll be notified when the price drops below this value'
                }
              </span>
            </div>

            {/* Notification Info */}
            <div className="alert-info">
              <Bell size={16} />
              <span>You'll receive an email notification when this alert triggers.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !targetPrice}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  Set Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertModal;