import { io, Socket } from 'socket.io-client';
import type { PriceUpdate } from '../types/watchlist.types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private priceUpdateCallbacks: Set<(data: PriceUpdate) => void> = new Set();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Connect to the server
  connect(): void {
    if (this.socket?.connected) {
      console.log('📡 Socket already connected');
      return;
    }

    console.log(`📡 Connecting to socket server: ${SOCKET_URL}`);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  // Setup socket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection established
    this.socket.on('connect', () => {
      console.log(' Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.notifyConnectionChange(true);
    });

    // Connection lost
    this.socket.on('disconnect', (reason) => {
      console.log(' Socket disconnected:', reason);
      this.notifyConnectionChange(false);
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error(' Socket connection error:', error.message);
      this.reconnectAttempts++;
      this.notifyConnectionChange(false);
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(` Socket reconnection attempt ${attempt}/${this.maxReconnectAttempts}`);
    });

    // Reconnected successfully
    this.socket.on('reconnect', (attempt) => {
      console.log(` Socket reconnected after ${attempt} attempts`);
      this.notifyConnectionChange(true);
    });

    // Server confirmation of connection
    this.socket.on('connected', (data) => {
      console.log(' Server confirmed connection:', data);
    });

    // Subscription confirmation
    this.socket.on('subscribed', (data) => {
      console.log(' Subscribed to stocks:', data.symbols);
    });

    // Unsubscription confirmation
    this.socket.on('unsubscribed', (data) => {
      console.log(' Unsubscribed from stocks:', data.symbols);
    });

    // Real-time price updates
    this.socket.on('price-update', (data: PriceUpdate) => {
      this.priceUpdateCallbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in price update callback:', error);
        }
      });
    });
  }

  // Notify all connection status listeners
  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  // Disconnect from the server
  disconnect(): void {
    if (this.socket) {
      console.log(' Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to stock symbols for real-time updates
  subscribeToStocks(symbols: string[]): void {
    if (!symbols || symbols.length === 0) {
      return;
    }

    if (this.socket?.connected) {
      const upperSymbols = symbols.map((s) => s.toUpperCase());
      console.log(' Subscribing to stocks:', upperSymbols);
      this.socket.emit('subscribe-stocks', upperSymbols);
    } else {
      console.warn(' Cannot subscribe: socket not connected');
    }
  }

  // Unsubscribe from stock symbols
  unsubscribeFromStocks(symbols: string[]): void {
    if (!symbols || symbols.length === 0) {
      return;
    }

    if (this.socket?.connected) {
      const upperSymbols = symbols.map((s) => s.toUpperCase());
      console.log(' Unsubscribing from stocks:', upperSymbols);
      this.socket.emit('unsubscribe-stocks', upperSymbols);
    }
  }

  // Register callback for price updates
  onPriceUpdate(callback: (data: PriceUpdate) => void): void {
    this.priceUpdateCallbacks.add(callback);
  }

  // Remove callback for price updates
  offPriceUpdate(callback: (data: PriceUpdate) => void): void {
    this.priceUpdateCallbacks.delete(callback);
  }

  // Register callback for connection status changes
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.add(callback);
    // Immediately notify current status
    callback(this.isConnected());
  }

  // Remove callback for connection status changes
  offConnectionChange(callback: (connected: boolean) => void): void {
    this.connectionCallbacks.delete(callback);
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Request server status
  requestStatus(): void {
    if (this.socket?.connected) {
      this.socket.emit('get-status');
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;