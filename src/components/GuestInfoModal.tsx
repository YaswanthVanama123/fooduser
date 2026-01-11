import React, { useState } from 'react';
import { UserCircle, Phone, Mail, LogIn } from 'lucide-react';
import Modal, { ModalBody, ModalFooter } from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { useRestaurant } from '../context/RestaurantContext';

export interface GuestInfo {
  name: string;
  phoneNumber: string;
  email?: string;
}

interface GuestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (guestInfo: GuestInfo) => void;
  onLoginInstead?: () => void;
}

const GuestInfoModal: React.FC<GuestInfoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onLoginInstead,
}) => {
  const { restaurant } = useRestaurant();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    email?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';

  // Validate phone number format (US format: XXX-XXX-XXXX or XXXXXXXXXX)
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+?1[-.\s]?)?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) || (digitsOnly.length === 10);
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) {
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    }
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10 digits)';
    }

    // Validate email (if provided)
    if (email.trim() && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const guestInfo: GuestInfo = {
        name: name.trim(),
        phoneNumber: phoneNumber.replace(/\D/g, ''), // Store digits only
        email: email.trim() || undefined,
      };

      onSubmit(guestInfo);

      // Reset form on success
      setName('');
      setPhoneNumber('');
      setEmail('');
      setErrors({});
    } catch (error) {
      console.error('Error submitting guest info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhoneNumber('');
    setEmail('');
    setErrors({});
    onClose();
  };

  const handleLoginInstead = () => {
    handleClose();
    if (onLoginInstead) {
      onLoginInstead();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Guest Information" size="sm">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <UserCircle className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <p className="text-gray-600">
              Please provide your contact information to place your order
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              error={errors.name}
              leftIcon={<UserCircle className="h-5 w-5" />}
              autoFocus
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="123-456-7890"
              value={phoneNumber}
              onChange={handlePhoneChange}
              error={errors.phoneNumber}
              leftIcon={<Phone className="h-5 w-5" />}
              helperText="We'll use this to contact you about your order"
              required
              maxLength={12}
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              error={errors.email}
              leftIcon={<Mail className="h-5 w-5" />}
              helperText="Optional: Receive order updates via email"
            />

            {/* Login Instead Option */}
            {onLoginInstead && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleLoginInstead}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogIn className="h-5 w-5" style={{ color: primaryColor }} />
                  <span className="text-gray-700 font-medium">
                    Already have an account? Login instead
                  </span>
                </button>
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isSubmitting}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${restaurant?.branding?.secondaryColor || '#8b5cf6'} 100%)`,
            }}
          >
            Continue
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default GuestInfoModal;
