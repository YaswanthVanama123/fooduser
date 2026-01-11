import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import Modal, { ModalBody, ModalFooter } from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useRestaurant } from '../context/RestaurantContext';

interface LoginOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => Promise<void>;
}

/**
 * Strict login-only modal - NO registration option
 * Used when clicking "Login" button in header
 */
const LoginOnlyModal: React.FC<LoginOnlyModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const { restaurant } = useRestaurant();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(username.trim());

      // Reset form on success
      setUsername('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your username.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Login" size="sm">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <LogIn className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <p className="text-gray-600">
              Enter your username to continue
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              leftIcon={<LogIn className="h-5 w-5" />}
              autoFocus
              helperText="Login to access your account"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Info message */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Don't have an account? You can register when placing your first order.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            Login
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default LoginOnlyModal;
