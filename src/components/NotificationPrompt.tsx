import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import Button from './ui/Button';
import firebaseService from '../services/firebase.service';

interface NotificationPromptProps {
  onRequestPermission: () => Promise<void>;
  onDismiss: () => void;
}

const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  onRequestPermission,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkShouldShow = () => {
      // Don't show if Firebase is not ready
      if (!firebaseService.isReady()) {
        return false;
      }

      // Check permission status
      const permission = firebaseService.getPermissionStatus();

      // Show prompt only if permission is 'default' (not asked yet)
      if (permission === 'default') {
        // Check if user dismissed it before (stored in localStorage)
        const dismissed = localStorage.getItem('fcm-prompt-dismissed');
        if (!dismissed) {
          return true;
        }
      }

      return false;
    };

    const shouldShow = checkShouldShow();
    setIsVisible(shouldShow);
  }, []);

  const handleEnable = async () => {
    setIsVisible(false);
    await onRequestPermission();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 7 days
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('fcm-prompt-dismissed', dismissedUntil.toString());
    onDismiss();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Bell className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Enable Order Notifications
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Get real-time updates when your order status changes. Never miss an update!
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnable}
                className="text-xs"
              >
                Enable Notifications
              </Button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
