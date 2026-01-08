/**
 * Application Constants
 * Centralized configuration values
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 30000, // 30 seconds
} as const;

// Socket.io Configuration
export const SOCKET_CONFIG = {
  BASE_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  RECONNECTION_ATTEMPTS: 5,
} as const;

// Cart Configuration
export const CART_CONFIG = {
  TAX_RATE: 0.08, // 8% tax
  LOCAL_STORAGE_KEY: 'cart',
  TABLE_ID_KEY: 'tableId',
  TABLE_NUMBER_KEY: 'tableNumber',
  RESTAURANT_ID_KEY: 'restaurantId',
  RESTAURANT_NAME_KEY: 'restaurantName',
} as const;

// Order Status Configuration
export const ORDER_STATUS = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.RECEIVED]: 'Order Received',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.SERVED]: 'Served',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
} as const;

export const ORDER_STATUS_ICONS = {
  [ORDER_STATUS.RECEIVED]: '📋',
  [ORDER_STATUS.PREPARING]: '👨‍🍳',
  [ORDER_STATUS.READY]: '✅',
  [ORDER_STATUS.SERVED]: '🎉',
  [ORDER_STATUS.CANCELLED]: '❌',
} as const;

// Toast Notification Configuration
export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: 'top-right',
  STYLE: {
    SUCCESS: {
      backgroundColor: '#10b981',
      color: '#fff',
    },
    ERROR: {
      backgroundColor: '#ef4444',
      color: '#fff',
    },
    DEFAULT: {
      backgroundColor: '#363636',
      color: '#fff',
    },
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEFAULT_PRIMARY_COLOR: '#6366f1',
  DEFAULT_SECONDARY_COLOR: '#8b5cf6',
  DEFAULT_ACCENT_COLOR: '#ec4899',
  MAX_CART_QUANTITY: 50,
  ITEMS_PER_PAGE: 20,
} as const;

// Debounce Delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 500,
  FILTER: 300,
  RESIZE: 250,
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  MENU: '/menu',
  CART: '/cart',
  ORDER_TRACKING: '/order/:orderId',
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Customer Events (Emit)
  JOIN_TABLE: 'join-table',
  LEAVE_TABLE: 'leave-table',
  TRACK_ORDER: 'track-order',
  STOP_TRACKING_ORDER: 'stop-tracking-order',

  // Customer Events (Listen)
  TABLE_JOINED: 'table-joined',
  ORDER_UPDATED: 'order-updated',
  ORDER_STATUS_UPDATED: 'order-status-updated',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_SEARCH: true,
  ENABLE_DIETARY_FILTERS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_ORDER_NOTES: true,
  ENABLE_SPECIAL_INSTRUCTIONS: true,
} as const;
