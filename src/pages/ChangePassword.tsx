import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, Check, X, Shield, ArrowLeft } from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useRestaurant } from '../context/RestaurantContext';
import authApi from '../api/auth.api';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
  });

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    let label = '';
    let color = '';

    if (score === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Weak';
      color = '#ef4444';
    } else if (score === 3) {
      label = 'Fair';
      color = '#f59e0b';
    } else if (score === 4) {
      label = 'Good';
      color = '#3b82f6';
    } else {
      label = 'Strong';
      color = '#10b981';
    }

    return { score, label, color, requirements };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Update password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    } else if (passwordStrength.score < 3) {
      newErrors.newPassword = 'Password is not strong enough';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Password changed successfully!', {
        style: {
          background: primaryColor,
          color: '#fff',
        },
        duration: 4000,
      });

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength({
        score: 0,
        label: '',
        color: '',
        requirements: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecialChar: false,
        },
      });

      // Redirect to profile after 1.5 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to change password. Please try again.';
      toast.error(errorMessage, {
        duration: 4000,
      });

      // If current password is wrong, highlight that field
      if (errorMessage.toLowerCase().includes('current password')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Profile', path: '/profile' },
    { label: 'Change Password', path: '/change-password' },
  ];

  return (
    <>
      <SEO
        title="Change Password"
        description="Change your account password securely"
        keywords={['change password', 'security', 'account settings']}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
            <p className="text-gray-600 mt-2">
              Keep your account secure with a strong password
            </p>
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Update Your Password</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardBody className="space-y-6">
                {/* Current Password */}
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  label="Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="focus:outline-none hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                  error={errors.currentPassword}
                  placeholder="Enter your current password"
                  required
                  disabled={isSubmitting}
                />

                {/* New Password */}
                <div>
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    label="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="focus:outline-none hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    }
                    error={errors.newPassword}
                    placeholder="Enter your new password"
                    required
                    disabled={isSubmitting}
                  />

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Password Strength:
                        </span>
                        {passwordStrength.label && (
                          <span
                            className="text-sm font-semibold"
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>

                      {/* Strength Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color || '#e5e7eb',
                          }}
                        />
                      </div>

                      {/* Requirements Checklist */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 mb-3">
                          Password Requirements:
                        </p>
                        {[
                          {
                            met: passwordStrength.requirements.minLength,
                            text: 'At least 8 characters',
                          },
                          {
                            met: passwordStrength.requirements.hasUppercase,
                            text: 'One uppercase letter',
                          },
                          {
                            met: passwordStrength.requirements.hasLowercase,
                            text: 'One lowercase letter',
                          },
                          {
                            met: passwordStrength.requirements.hasNumber,
                            text: 'One number',
                          },
                          {
                            met: passwordStrength.requirements.hasSpecialChar,
                            text: 'One special character',
                          },
                        ].map((requirement, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            {requirement.met ? (
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span
                              className={
                                requirement.met
                                  ? 'text-green-700 font-medium'
                                  : 'text-gray-600'
                              }
                            >
                              {requirement.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="focus:outline-none hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                  error={errors.confirmPassword}
                  placeholder="Confirm your new password"
                  required
                  disabled={isSubmitting}
                />

                {/* Security Tips */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Security Tips
                      </h3>
                      <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                        <li>Use a unique password that you don't use elsewhere</li>
                        <li>Avoid common words and personal information</li>
                        <li>Consider using a password manager</li>
                        <li>Change your password regularly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardBody>

              <CardFooter>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => navigate('/profile')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Forgot your current password?{' '}
              <button
                onClick={() =>
                  toast.error(
                    'Password reset feature coming soon. Please contact support.'
                  )
                }
                className="font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
