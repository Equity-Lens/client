import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { CreateHoldingData } from '../../../types/portfolio.types';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHoldingData) => Promise<void>;
  portfolioName?: string;
}

const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  portfolioName,
}) => {
  // Form state
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const symbolInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSymbol('');
      setQuantity('');
      setAvgPrice('');
      setNotes('');
      setError(null);
      setTimeout(() => symbolInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!avgPrice || parseFloat(avgPrice) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        symbol: symbol.toUpperCase().trim(),
        quantity: parseFloat(quantity),
        avg_buy_price: parseFloat(avgPrice),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
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
      <div className="modal add-holding-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h3>Add Stock</h3>
            {portfolioName && (
              <span className="modal-subtitle">to {portfolioName}</span>
            )}
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Error Message */}
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {/* Stock Symbol */}
            <div className="form-group">
              <label htmlFor="symbol">Stock Symbol</label>
              <input
                ref={symbolInputRef}
                id="symbol"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                maxLength={10}
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                min="0.0001"
                step="any"
                disabled={loading}
              />
            </div>

            {/* Average Buy Price */}
            <div className="form-group">
              <label htmlFor="avgPrice">Average Buy Price</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  id="avgPrice"
                  type="number"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="150.00"
                  min="0.01"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Notes (Optional) */}
            <div className="form-group">
              <label htmlFor="notes">
                Notes <span className="optional-tag">Optional</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this investment..."
                rows={3}
                disabled={loading}
              />
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
              disabled={loading || !symbol || !quantity || !avgPrice}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Adding...
                </>
              ) : (
                'Add Stock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHoldingModal;