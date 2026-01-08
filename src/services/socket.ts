import { io, Socket } from 'socket.io-client';

/**
 * Socket Service for Multi-Tenant Real-Time Updates
 * Connects to restaurant-specific namespace: /restaurant/{restaurantId}
 */

const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private restaurantId: string | null = null;

  /**
   * Connect to restaurant-specific namespace
   */
  connect(restaurantId: string): Socket {
    if (this.socket && this.socket.connected && this.restaurantId === restaurantId) {
      return this.socket;
    }

    // Disconnect existing connection if different restaurant
    if (this.socket) {
      this.disconnect();
    }

    this.restaurantId = restaurantId;
    const namespace = `/restaurant/${restaurantId}`;

    console.log(`Connecting to Socket.io namespace: ${namespace}`);

    this.socket = io(`${SOCKET_BASE_URL}${namespace}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventHandlers();

    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      console.log('Restaurant namespace:', this.restaurantId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after maximum attempts');
    });
  }

  /**
   * Disconnect from socket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.restaurantId = null;
    }
  }

  /**
   * Join table room for table-specific updates
   */
  joinTable(tableNumber: string): void {
    if (this.socket && this.socket.connected) {
      console.log('Joining table room:', tableNumber);
      this.socket.emit('join-table', { tableNumber });
    } else {
      console.warn('Socket not connected. Cannot join table.');
    }
  }

  /**
   * Leave table room
   */
  leaveTable(tableNumber: string): void {
    if (this.socket && this.socket.connected) {
      console.log('Leaving table room:', tableNumber);
      this.socket.emit('leave-table', { tableNumber });
    }
  }

  /**
   * Track specific order for real-time updates
   */
  trackOrder(orderId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('Tracking order:', orderId);
      this.socket.emit('track-order', { orderId });
    } else {
      console.warn('Socket not connected. Cannot track order.');
    }
  }

  /**
   * Stop tracking order
   */
  stopTrackingOrder(orderId: string): void {
    if (this.socket && this.socket.connected) {
      console.log('Stopping order tracking:', orderId);
      this.socket.emit('stop-tracking-order', { orderId });
    }
  }

  /**
   * Subscribe to event
   */
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Emit custom event
   */
  emit(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  /**
   * Get current restaurant ID
   */
  getRestaurantId(): string | null {
    return this.restaurantId;
  }
}

export default new SocketService();
