import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import firebaseService from '../services/firebase.service';
import apiClient from '../api/client';

// API helper for FCM token management
const fcmTokenApi = {
  register: async (token: string) => {
    const response = await apiClient.post('/customers/fcm-token', { token });
    return response.data;
  },
  remove: async () => {
    const response = await apiClient.delete('/customers/fcm-token');
    return response.data;
  },
};

interface NotificationCallbacks {
  onOrderUpdate?: (orderId: string) => void;
  onMenuUpdate?: () => void;
  onCartUpdate?: () => void;
}

/**
 * Custom hook for handling Firebase Cloud Messaging notifications
 * Supports both silent (data-only) and active (visible) notifications
 *
 * @param isAuthenticated - Whether user is logged in
 * @param callbacks - Optional callbacks for different notification types
 */
export const useNotifications = (
  isAuthenticated: boolean,
  callbacks?: NotificationCallbacks
) => {
  const navigate = useNavigate();
  const tokenRegistered = useRef(false);
  const currentToken = useRef<string | null>(null);

  /**
   * Handle silent notifications - trigger API calls without showing notification
   */
  const handleSilentNotification = useCallback(
    async (data: Record<string, string>) => {
      console.log('📡 Silent notification received:', data);

      const action = data.action;
      const type = data.type;

      // ORDER UPDATES - Refresh order data
      if (action === 'refresh_order' && data.orderId) {
        console.log('🔄 Refreshing order:', data.orderId);
        if (callbacks?.onOrderUpdate) {
          callbacks.onOrderUpdate(data.orderId);
        }
      }

      // MENU UPDATES - Refresh menu data
      if (action === 'refresh_menu') {
        console.log('🔄 Refreshing menu');
        if (callbacks?.onMenuUpdate) {
          callbacks.onMenuUpdate();
        }
      }

      // CART UPDATES - Refresh cart data
      if (action === 'refresh_cart') {
        console.log('🔄 Refreshing cart');
        if (callbacks?.onCartUpdate) {
          callbacks.onCartUpdate();
        }
      }
    },
    [callbacks]
  );

  /**
   * Handle active notifications - visible alerts to the user
   */
  const handleActiveNotification = useCallback(
    (data: Record<string, string>) => {
      console.log('\n🔔 ===== HANDLING ACTIVE NOTIFICATION =====');
      console.log('📥 Received data:', data);

      const category = data.category;
      const clickAction = data.clickAction;

      console.log('   Category:', category);
      console.log('   Click Action:', clickAction);

      // Show toast notification for order status updates
      if (category === 'order_status') {
        const orderId = data.orderId;
        const orderNumber = data.orderNumber;
        const status = data.status;

        // Get title and body from data (sent by backend)
        // These will be in the notification object, but also passed in data for consistency
        const title = data.title || `Order #${orderNumber}`;
        const body = data.body || `Status: ${status}`;

        console.log('📱 Showing toast notification:');
        console.log('   Title:', title);
        console.log('   Body:', body);
        console.log('   Order ID:', orderId);
        console.log('   Order Number:', orderNumber);
        console.log('   Status:', status);

        // Show toast with title and body
        toast.success(body, {
          duration: 5000,
          onClick: () => {
            if (clickAction) {
              console.log('🔗 User clicked notification, navigating to:', clickAction);
              navigate(clickAction);
            }
          },
        } as any); // Type assertion: onClick is supported but not in type definitions

        console.log('✅ Toast notification displayed');

        // Also trigger refresh
        if (callbacks?.onOrderUpdate && orderId) {
          console.log('🔄 Triggering order refresh callback for:', orderId);
          callbacks.onOrderUpdate(orderId);
        }
      } else {
        console.log('⚠️  Unknown category:', category);
        console.log('   Available categories: order_status');
        console.log('   This notification will not show a toast');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    },
    [navigate, callbacks]
  );

  /**
   * Register FCM token with backend
   * OPTIMIZATION: Check localStorage first to avoid unnecessary API calls
   */
  const registerToken = useCallback(async () => {
    if (!isAuthenticated || !firebaseService.isReady()) {
      return;
    }

    try {
      console.log('🔑 Requesting FCM token from Firebase...');

      // Get FCM token
      const token = await firebaseService.getToken();

      if (!token) {
        console.log('❌ No FCM token available');
        return;
      }

      console.log('🎫 FCM Token Generated:');
      console.log('   Full token:', token);
      console.log('   Token preview:', token.substring(0, 50) + '...');

      // OPTIMIZATION: Check if token is already registered in localStorage
      const storedToken = localStorage.getItem('fcmToken');
      if (storedToken === token) {
        console.log('✅ FCM token already registered (found in localStorage), skipping API call');
        currentToken.current = token;
        tokenRegistered.current = true;
        return;
      }

      // Register with backend only if token is new or changed
      console.log('📤 Registering new/changed token with backend...');
      const response = await fcmTokenApi.register(token);
      console.log('   Backend response:', response);

      // Store token in localStorage to avoid future API calls
      localStorage.setItem('fcmToken', token);

      currentToken.current = token;
      tokenRegistered.current = true;

      console.log('✅ FCM token registered with backend and saved to localStorage!');
    } catch (error) {
      console.error('❌ Failed to register FCM token:', error);
    }
  }, [isAuthenticated]);

  /**
   * Remove FCM token from backend (on logout)
   * Also clears from localStorage
   */
  const unregisterToken = useCallback(async () => {
    if (!currentToken.current) {
      return;
    }

    try {
      await fcmTokenApi.remove();
      await firebaseService.deleteToken();

      // Clear from localStorage
      localStorage.removeItem('fcmToken');

      currentToken.current = null;
      tokenRegistered.current = false;

      console.log('✅ FCM token removed from backend and localStorage');
    } catch (error) {
      console.error('Failed to remove FCM token:', error);
    }
  }, []);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async () => {
    const permission = await firebaseService.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      await registerToken();
    } else if (permission === 'denied') {
      console.log('❌ Notification permission denied');
      toast.error('Notifications are blocked. Enable them in browser settings for real-time updates.');
    }
  }, [registerToken]);

  /**
   * Check permission status
   */
  const checkPermission = useCallback(() => {
    return firebaseService.getPermissionStatus();
  }, []);

  /**
   * Setup foreground message listener
   */
  useEffect(() => {
    if (!firebaseService.isReady()) {
      console.log('⚠️  [useNotifications] Firebase not ready, skipping message listener setup');
      return;
    }

    console.log('\n📡 [useNotifications] Setting up foreground message listener...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 Current page visibility:', document.visibilityState);
    console.log('👁️  Document is hidden:', document.hidden);
    console.log('🎯 Document has focus:', document.hasFocus());

    // Listen for foreground messages
    firebaseService.onForegroundMessage((payload) => {
      console.log('📩 [useNotifications] Foreground message received in hook!');
      console.log('   Type:', payload.type);
      console.log('   Data keys:', Object.keys(payload.data));
      console.log('   Full data:', payload.data);
      console.log('   Page visibility at receipt:', document.visibilityState);
      console.log('   Page has focus:', document.hasFocus());

      const { type, data } = payload;

      if (type === 'silent') {
        console.log('🔇 [useNotifications] Type is SILENT - calling handleSilentNotification...');
        handleSilentNotification(data);
      } else if (type === 'active') {
        console.log('🔔 [useNotifications] Type is ACTIVE - calling handleActiveNotification...');
        handleActiveNotification(data);
      } else {
        console.log('❓ [useNotifications] Unknown notification type:', type);
        console.log('   Expected: "silent" or "active"');
        console.log('   Received:', type);
        console.log('   Data:', data);
      }
    });

    console.log('✅ [useNotifications] Foreground message listener setup complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Add visibility change listener to debug
    const handleVisibilityChange = () => {
      console.log('👁️  [useNotifications] Visibility changed:', document.visibilityState);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleSilentNotification, handleActiveNotification]);

  /**
   * Setup service worker message listener for background notifications
   */
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️  Service workers not supported');
      return;
    }

    console.log('📡 Setting up service worker message listener...');

    const messageHandler = (event: MessageEvent) => {
      console.log('📬 Service worker message received:', event.data);

      if (event.data?.type === 'SILENT_NOTIFICATION') {
        console.log('🔇 Handling silent notification from service worker...');
        handleSilentNotification(event.data.data);
      } else if (event.data?.type === 'NAVIGATE') {
        console.log('🧭 Navigating to:', event.data.url);
        navigate(event.data.url);
      } else {
        console.log('❓ Unknown service worker message type:', event.data?.type);
      }
    };

    navigator.serviceWorker.addEventListener('message', messageHandler);

    console.log('✅ Service worker message listener setup complete');

    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      console.log('🗑️ Service worker message listener removed');
    };
  }, [handleSilentNotification, navigate]);

  /**
   * Auto-register token when user logs in
   */
  useEffect(() => {
    if (isAuthenticated && !tokenRegistered.current) {
      // Check if permission is already granted
      const permission = firebaseService.getPermissionStatus();

      if (permission === 'granted') {
        registerToken();
      }
    } else if (!isAuthenticated && tokenRegistered.current) {
      // Unregister when user logs out
      unregisterToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only depend on isAuthenticated, not the callback functions

  return {
    requestPermission,
    checkPermission,
    isReady: firebaseService.isReady(),
    permissionStatus: checkPermission(),
  };
};

export default useNotifications;
