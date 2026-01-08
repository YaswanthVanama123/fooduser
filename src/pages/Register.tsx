import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, UserPlus, LogIn } from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useUser } from '../context/UserContext';
import { useRestaurant } from '../context/RestaurantContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useUser();
  const { restaurant } = useRestaurant();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
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
      setIsLoading(true);
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      toast.success('Account created successfully! Welcome!', {
        style: {
          background: primaryColor,
          color: '#fff',
        },
      });

      // Redirect to home or previous page
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
      navigate(redirectTo);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Restaurant Logo */}
        {restaurant?.branding?.logo && (
          <div className="text-center mb-8">
            <div className="inline-block bg-white p-4 rounded-2xl shadow-lg">
              <img
                src={restaurant.branding.logo}
                alt={restaurant.name}
                className="h-16 w-16 object-contain"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{restaurant.name}</h2>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Create Account</h3>
              <p className="text-gray-600 mt-2">Join us for a better dining experience</p>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  leftIcon={<User className="h-5 w-5" />}
                  error={errors.firstName}
                  required
                />

                <Input
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  leftIcon={<User className="h-5 w-5" />}
                  error={errors.lastName}
                  required
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="h-5 w-5" />}
                error={errors.email}
                required
              />

              <Input
                type="tel"
                name="phone"
                label="Phone Number (Optional)"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone className="h-5 w-5" />}
                error={errors.phone}
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock className="h-5 w-5" />}
                error={errors.password}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<Lock className="h-5 w-5" />}
                error={errors.confirmPassword}
                required
              />

              <div className="space-y-2">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      className="font-medium hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className="font-medium hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms}</p>
                )}
              </div>
            </CardBody>

            <CardFooter>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </Button>

              <div className="mt-4 text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/login"
                  className="font-semibold hover:underline"
                  style={{ color: primaryColor }}
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                  Continue as guest
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Benefits Reminder */}
        <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
          <CardBody className="py-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-green-600" />
              Member Benefits
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Save your favorite items for quick reordering</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Track your order history and preferences</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Get personalized menu recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Exclusive offers and early access to new items</span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Register;
