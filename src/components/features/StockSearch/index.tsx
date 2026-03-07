import React from "react";
import { useDebounceSearch } from "../../../hooks/useDebounceSearch";
import "../../../styles/components/_stock-search.scss";

const StockSearch: React.FC = () => {
  const { query, results, loading, error, updateQuery, clearSearch } =
    useDebounceSearch(300);

  return (
    <div className="stock-search">
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search stocks by symbol or company name..."
            className="search-input"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          {query && (
            <button
              onClick={clearSearch}
              className="clear-button"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {results.length > 0 && !loading && (
          <div className="search-results">
            <div className="results-header">
              <span>
                {results.length} {results.length === 1 ? "Result" : "Results"}{" "}
                Found
              </span>
              <span className="live-indicator">
                <span className="pulse"></span>
                Streaming Live Prices
              </span>
            </div>
            <div className="results-list">
              {results.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="stock-item"
                  tabIndex={0}
                  role="button"
                  aria-label={`${stock.symbol} - ${stock.name}, Price: $${
                    stock.price > 0 ? stock.price.toFixed(2) : "Loading..."
                  }, Change: ${
                    stock.change >= 0 ? "+" : ""
                  }${stock.change.toFixed(2)}%`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="stock-info">
                    <div className="stock-symbol">{stock.symbol}</div>
                    <div className="stock-name">{stock.name}</div>
                  </div>
                  <div className="stock-metrics">
                    {stock.price > 0 ? (
                      <>
                        <div className="stock-price">
                          ${stock.price.toFixed(2)}
                        </div>
                        <span
                          className={`stock-change ${
                            stock.change >= 0 ? "positive" : "negative"
                          }`}
                        >
                          {stock.change >= 0 ? "▲" : "▼"}
                          {Math.abs(stock.change).toFixed(2)}%
                        </span>
                      </>
                    ) : (
                      <div className="stock-loading">
                        <div className="loading-dots">
                          <span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && !loading && results.length === 0 && !error && (
          // <div className="no-results">
          <div>
            No stocks found matching "<strong>{query}</strong>"
            <br />
            <small>Try searching with a different symbol or company name</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSearch;
