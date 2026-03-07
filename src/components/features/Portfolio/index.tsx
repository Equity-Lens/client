import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MoreHorizontal,
  Star,
  Edit3,
  Trash2,
  Check,
} from 'lucide-react';
import type { Portfolio, CreatePortfolioData } from '../../../types/portfolio.types';

interface PortfolioTabsProps {
  portfolios: Portfolio[];
  activePortfolioId: number | null;
  onSelectPortfolio: (id: number) => void;
  onCreatePortfolio: (data: CreatePortfolioData) => Promise<void>;
  onUpdatePortfolio: (id: number, data: Partial<CreatePortfolioData>) => Promise<void>;
  onDeletePortfolio: (id: number) => Promise<void>;
  onSetDefault: (id: number) => Promise<void>;
  loading?: boolean;
}

const PortfolioTabs: React.FC<PortfolioTabsProps> = ({
  portfolios,
  activePortfolioId,
  onSelectPortfolio,
  onCreatePortfolio,
  onUpdatePortfolio,
  onDeletePortfolio,
  onSetDefault,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleMenuClick = (e: React.MouseEvent, portfolioId: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === portfolioId ? null : portfolioId);
  };

  const handleRename = (portfolio: Portfolio) => {
    setEditingId(portfolio.id);
    setEditName(portfolio.name);
    setOpenMenuId(null);
  };

  const handleSaveRename = async (portfolioId: number) => {
    if (editName.trim()) {
      await onUpdatePortfolio(portfolioId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, portfolioId: number) => {
    if (e.key === 'Enter') {
      handleSaveRename(portfolioId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditName('');
    }
  };

  const handleSetDefault = async (portfolioId: number) => {
    await onSetDefault(portfolioId);
    setOpenMenuId(null);
  };

  const handleDelete = async (portfolio: Portfolio) => {
    const message = `Delete "${portfolio.name}"? All holdings and alerts will be permanently removed.`;
    if (window.confirm(message)) {
      await onDeletePortfolio(portfolio.id);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="portfolio-tabs-container">
      <div className="portfolio-tabs">
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className={`portfolio-tab ${activePortfolioId === portfolio.id ? 'active' : ''} ${openMenuId === portfolio.id ? 'menu-open' : ''}`}
            onClick={() => !editingId && onSelectPortfolio(portfolio.id)}
          >
            {editingId === portfolio.id ? (
              // Inline rename input
              <input
                ref={editInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleSaveRename(portfolio.id)}
                onKeyDown={(e) => handleKeyDown(e, portfolio.id)}
                onClick={(e) => e.stopPropagation()}
                className="tab-rename-input"
              />
            ) : (
              <>
                <span className="tab-name">{portfolio.name}</span>
                
                {portfolio.is_default && (
                  <span className="default-indicator" title="Default Portfolio">
                    <Star size={12} fill="currentColor" />
                  </span>
                )}

                <button
                  className="tab-menu-trigger"
                  onClick={(e) => handleMenuClick(e, portfolio.id)}
                  title="Options"
                >
                  <MoreHorizontal size={14} />
                </button>
              </>
            )}

            {/* Dropdown Menu */}
            {openMenuId === portfolio.id && (
              <div className="tab-dropdown" ref={menuRef}>
                <button
                  className="dropdown-item"
                  onClick={() => handleRename(portfolio)}
                >
                  <Edit3 className="icon" />
                  Rename
                </button>
                
                {!portfolio.is_default && (
                  <button
                    className="dropdown-item"
                    onClick={() => handleSetDefault(portfolio.id)}
                  >
                    <Star className="icon" />
                    Set as Default
                  </button>
                )}
                
                {portfolio.is_default && (
                  <button className="dropdown-item dropdown-item-active" disabled>
                    <Check className="icon" />
                    Default Portfolio
                  </button>
                )}

                <div className="dropdown-divider" />
                
                <button
                  className="dropdown-item dropdown-item-danger"
                  onClick={() => handleDelete(portfolio)}
                >
                  <Trash2 className="icon" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add New Portfolio Button */}
        <button
          className="portfolio-tab-add"
          onClick={() => setShowCreateModal(true)}
          title="Add Portfolio"
        >
          <Plus className="icon" />
        </button>
      </div>

      {/* Create Portfolio Modal - You can reuse your existing modal component */}
      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            await onCreatePortfolio(data);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Simple Create Portfolio Modal
const CreatePortfolioModal: React.FC<{
  onClose: () => void;
  onCreate: (data: CreatePortfolioData) => Promise<void>;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [broker, setBroker] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await onCreate({
        name: name.trim(),
        broker_name: broker.trim() || undefined,
        is_default: isDefault,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Portfolio</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Portfolio Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Robinhood, Long Term"
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label>Broker (Optional)</label>
              <input
                type="text"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="e.g., Robinhood, Fidelity"
              />
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span>Set as default portfolio</span>
            </label>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!name.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioTabs;