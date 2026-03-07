import { useState, useEffect, useCallback, useRef } from "react";
import type { SearchState } from "../types/stock";

// Configuration constants
const FINNHUB_WS_URL = 'wss://ws.finnhub.io';
const DEFAULT_DELAY = 300;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export const useDebounceSearch = (delay: number = DEFAULT_DELAY) => {
    // Get API token from environment
    const apiToken = import.meta.env.VITE_FINNHUB_API_TOKEN;
    const debugMode = import.meta.env.VITE_DEBUG === 'true';

    const [searchState, setSearchState] = useState<SearchState>({
        query: "",
        results: [],
        loading: false,
        error: null,
    });

    const [debounceQuery, setDebounceQuery] = useState('');
    const wsRef = useRef<WebSocket | null>(null);
    const subscribedSymbolsRef = useRef<Set<string>>(new Set());
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const priceDataRef = useRef<Map<string, any>>(new Map());

    // Initialize WebSocket connection
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            const ws = new WebSocket(`${FINNHUB_WS_URL}?token=${apiToken}`);
            
            ws.addEventListener('open', (event) => {
                if (debugMode) {
                    console.log('WebSocket connected:', event);
                }
                reconnectAttemptsRef.current = 0;
                
                // Resubscribe to previously subscribed symbols
                subscribedSymbolsRef.current.forEach(symbol => {
                    ws.send(JSON.stringify({ type: 'subscribe', symbol }));
                });
            });

            ws.addEventListener('message', (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    if (message.type === 'trade' && message.data) {
                        message.data.forEach((trade: any) => {
                            const symbol = trade.s;
                            const existingData = priceDataRef.current.get(symbol) || {};
                            
                            // Update price data
                            priceDataRef.current.set(symbol, {
                                symbol: symbol,
                                name: existingData.name || symbol,
                                price: trade.p,
                                change: existingData.change || 0,
                                volume: trade.v,
                                timestamp: trade.t,
                            });
                        });

                        // Update results if they match current search
                        setSearchState(prev => {
                            if (!prev.query) return prev;
                            
                            const updatedResults = prev.results.map(stock => {
                                const liveData = priceDataRef.current.get(stock.symbol);
                                if (liveData) {
                                    const priceChange = stock.price ? 
                                        ((liveData.price - stock.price) / stock.price * 100) : 0;
                                    return {
                                        ...stock,
                                        price: liveData.price,
                                        change: priceChange,
                                    };
                                }
                                return stock;
                            });
                            
                            return { ...prev, results: updatedResults };
                        });
                    }
                } catch (error) {
                    if (debugMode) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                }
            });

            ws.addEventListener('error', (error) => {
                if (debugMode) {
                    console.error('WebSocket error:', error);
                }
                setSearchState(prev => ({
                    ...prev,
                    error: 'Connection error. Retrying...'
                }));
            });

            ws.addEventListener('close', () => {
                if (debugMode) {
                    console.log('WebSocket closed');
                }
                wsRef.current = null;

                // Attempt to reconnect
                if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttemptsRef.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, RECONNECT_DELAY);
                } else {
                    setSearchState(prev => ({
                        ...prev,
                        error: 'Connection lost. Please refresh the page.'
                    }));
                }
            });

            wsRef.current = ws;
        } catch (error) {
            if (debugMode) {
                console.error('Failed to create WebSocket:', error);
            }
            setSearchState(prev => ({
                ...prev,
                error: 'Failed to connect to real-time data service'
            }));
        }
    }, [apiToken, debugMode]);

    // Subscribe to stock symbol
    const subscribeToSymbol = useCallback((symbol: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        if (!subscribedSymbolsRef.current.has(symbol)) {
            wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
            subscribedSymbolsRef.current.add(symbol);
            
            if (debugMode) {
                console.log('Subscribed to:', symbol);
            }
        }
    }, [debugMode]);

    // Unsubscribe from stock symbol
    const unsubscribeFromSymbol = useCallback((symbol: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        if (subscribedSymbolsRef.current.has(symbol)) {
            wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
            subscribedSymbolsRef.current.delete(symbol);
            
            if (debugMode) {
                console.log('Unsubscribed from:', symbol);
            }
        }
    }, [debugMode]);

    // Initialize WebSocket on mount
    useEffect(() => {
        connectWebSocket();

        return () => {
            // Cleanup on unmount
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connectWebSocket]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceQuery(searchState.query);
        }, delay);

        return () => clearTimeout(timer);
    }, [searchState.query, delay]);

    // Fetch initial quote for a symbol
    const fetchQuote = useCallback(async (symbol: string) => {
        try {
            const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiToken}`;
            const response = await fetch(quoteUrl);
            
            if (!response.ok) {
                throw new Error('Quote fetch failed');
            }
            
            const quote = await response.json();
            
            // Update price data
            if (quote.c > 0) { // c = current price
                priceDataRef.current.set(symbol, {
                    symbol: symbol,
                    price: quote.c,
                    change: quote.dp || 0, // dp = percent change
                    timestamp: Date.now(),
                });
                
                // Update results
                setSearchState(prev => ({
                    ...prev,
                    results: prev.results.map(stock => 
                        stock.symbol === symbol 
                            ? { ...stock, price: quote.c, change: quote.dp || 0 }
                            : stock
                    ),
                }));
            }
        } catch (error) {
            if (debugMode) {
                console.error(`Failed to fetch quote for ${symbol}:`, error);
            }
        }
    }, [apiToken, debugMode]);

    // Search stocks and subscribe to updates
    useEffect(() => {
        const searchStocks = async (query: string) => {
            if (!query.trim()) {
                // Unsubscribe from all when search is cleared
                subscribedSymbolsRef.current.forEach(symbol => {
                    unsubscribeFromSymbol(symbol);
                });
                setSearchState(prev => ({ ...prev, results: [], loading: false, error: null }));
                return;
            }

            setSearchState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Search for stocks using Finnhub Symbol Lookup API
                const searchUrl = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiToken}`;
                const response = await fetch(searchUrl);
                
                if (!response.ok) {
                    throw new Error(`Search failed: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Format results
                const results = (data.result || [])
                    .slice(0, 10) // Limit to top 10 results
                    .map((item: any) => ({
                        symbol: item.symbol,
                        name: item.description || item.symbol,
                        price: 0, // Will be updated by fetchQuote
                        change: 0,
                    }));

                // Unsubscribe from old symbols
                subscribedSymbolsRef.current.forEach(symbol => {
                    if (!results.find((r: any) => r.symbol === symbol)) {
                        unsubscribeFromSymbol(symbol);
                    }
                });

                // Set results first
                setSearchState(prev => ({ 
                    ...prev, 
                    results, 
                    loading: false,
                    error: results.length === 0 ? null : prev.error
                }));

                // Fetch initial quotes and subscribe to WebSocket updates
                results.forEach((stock: any) => {
                    fetchQuote(stock.symbol);
                    subscribeToSymbol(stock.symbol);
                });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Search failed';
                if (debugMode) {
                    console.error("Search error:", error);
                }
                setSearchState(prev => ({ 
                    ...prev, 
                    results: [], 
                    loading: false, 
                    error: errorMessage 
                }));
            }
        };

        searchStocks(debounceQuery);
    }, [debounceQuery, apiToken, debugMode, subscribeToSymbol, unsubscribeFromSymbol, fetchQuote]);

    const updateQuery = useCallback((query: string) => {
        setSearchState(prev => ({ ...prev, query }));
    }, []);

    const clearSearch = useCallback(() => {
        // Unsubscribe from all symbols
        subscribedSymbolsRef.current.forEach(symbol => {
            unsubscribeFromSymbol(symbol);
        });
        
        setSearchState({
            query: '',
            results: [],
            loading: false,
            error: null,
        });
    }, [unsubscribeFromSymbol]);

    return {
        ...searchState,
        updateQuery,
        clearSearch,
    };
};