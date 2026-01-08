import React, { useState } from 'react';
import { User, CheckSquare, Square } from 'lucide-react';
import Modal, { ModalBody, ModalFooter } from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useRestaurant } from '../context/RestaurantContext';

interface SimpleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => Promise<void>;
  onRegister: (username: string) => Promise<void>;
}

const SimpleAuthModal: React.FC<SimpleAuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const { restaurant } = useRestaurant();
  const [username, setUsername] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isExistingUser) {
        await onLogin(username.trim());
      } else {
        await onRegister(username.trim());
      }

      // Reset form on success
      setUsername('');
      setIsExistingUser(false);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setIsExistingUser(false);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quick Sign In" size="sm">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <User className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <p className="text-gray-600">
              Enter your username to start ordering
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
              leftIcon={<User className="h-5 w-5" />}
              autoFocus
              helperText="Just a simple username to track your orders"
            />

            {/* Checkbox for existing user */}
            <div
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsExistingUser(!isExistingUser)}
            >
              {isExistingUser ? (
                <CheckSquare className="h-5 w-5" style={{ color: primaryColor }} />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-gray-700 font-medium">
                I already have an account
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
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
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${restaurant?.branding?.secondaryColor || '#8b5cf6'} 100%)`,
            }}
          >
            {isExistingUser ? 'Login' : 'Register'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default SimpleAuthModal;
