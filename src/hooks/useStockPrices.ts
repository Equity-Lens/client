import { useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';
import type { WatchlistStock, PriceUpdate } from '../types/watchlist.types';

interface UseStockPricesProps {
  stocks: WatchlistStock[];
  setStocks: React.Dispatch<React.SetStateAction<WatchlistStock[]>>;
}

export const useStockPrices = ({ stocks, setStocks }: UseStockPricesProps) => {
  // Track currently subscribed symbols to avoid duplicate subscriptions
  const subscribedSymbolsRef = useRef<string[]>([]);
  const isConnectedRef = useRef<boolean>(false);

  // Handle incoming price updates from WebSocket
  const handlePriceUpdate = useCallback(
    (data: PriceUpdate) => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          // Only update the stock that matches the symbol
          if (stock.symbol !== data.symbol) {
            return stock;
          }

          // Calculate change using stored previousClose
          const newPrice = data.price;
          const previousClose = stock.previousClose;

          // Avoid division by zero
          const change = previousClose > 0 ? newPrice - previousClose : 0;
          const changePercent = previousClose > 0 
            ? (change / previousClose) * 100 
            : 0;

          console.log(
            `📊 ${stock.symbol}: $${stock.price.toFixed(2)} → $${newPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`
          );

          return {
            ...stock,
            price: newPrice,
            change,
            changePercent,
            volume: data.volume || stock.volume,
          };
        })
      );
    },
    [setStocks]
  );

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    isConnectedRef.current = connected;
    console.log(`📡 Socket connection status: ${connected ? 'Connected' : 'Disconnected'}`);

    // Resubscribe to symbols when reconnected
    if (connected && subscribedSymbolsRef.current.length > 0) {
      console.log('🔄 Resubscribing to stocks after reconnection...');
      socketService.subscribeToStocks(subscribedSymbolsRef.current);
    }
  }, []);

  // Connect to socket and register listeners on mount
  useEffect(() => {
    // Connect to socket server
    socketService.connect();

    // Register callbacks
    socketService.onPriceUpdate(handlePriceUpdate);
    socketService.onConnectionChange(handleConnectionChange);

    // Cleanup on unmount
    return () => {
      socketService.offPriceUpdate(handlePriceUpdate);
      socketService.offConnectionChange(handleConnectionChange);
    };
  }, [handlePriceUpdate, handleConnectionChange]);

  // Subscribe/unsubscribe when stocks list changes
  useEffect(() => {
    const newSymbols = stocks.map((s) => s.symbol.toUpperCase());
    const prevSymbols = subscribedSymbolsRef.current;

    // Find symbols to subscribe (in new list but not in previous)
    const toSubscribe = newSymbols.filter((s) => !prevSymbols.includes(s));

    // Find symbols to unsubscribe (in previous but not in new list)
    const toUnsubscribe = prevSymbols.filter((s) => !newSymbols.includes(s));

    // Unsubscribe from removed symbols
    if (toUnsubscribe.length > 0) {
      console.log('📉 Unsubscribing from:', toUnsubscribe);
      socketService.unsubscribeFromStocks(toUnsubscribe);
    }

    // Subscribe to new symbols
    if (toSubscribe.length > 0) {
      console.log('📈 Subscribing to:', toSubscribe);
      socketService.subscribeToStocks(toSubscribe);
    }

    // Update ref with current symbols
    subscribedSymbolsRef.current = newSymbols;
  }, [stocks]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      if (subscribedSymbolsRef.current.length > 0) {
        console.log('🧹 Cleaning up subscriptions...');
        socketService.unsubscribeFromStocks(subscribedSymbolsRef.current);
        subscribedSymbolsRef.current = [];
      }
    };
  }, []);

  // Return helper methods if needed by component
  return {
    isConnected: () => isConnectedRef.current,
    subscribedSymbols: () => subscribedSymbolsRef.current,
  };
};

export default useStockPrices;