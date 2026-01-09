import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BackButton from '../components/ui/BackButton';
import { useUser } from '../context/UserContext';
import { useRestaurant } from '../context/RestaurantContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { restaurant } = useRestaurant();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      await login(email, password);

      toast.success('Welcome back!', {
        style: {
          background: primaryColor,
          color: '#fff',
        },
      });

      // Redirect to home or previous page
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
      navigate(redirectTo);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton to="/" label="Back to Home" />
        </div>

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
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
              <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardBody className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-5 w-5" />}
                error={errors.email}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
                error={errors.password}
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Forgot password?
                </Link>
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
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </Button>

              <div className="mt-4 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to="/register"
                  className="font-semibold hover:underline"
                  style={{ color: primaryColor }}
                >
                  Sign up
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

        {/* Benefits Section */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
          <CardBody className="py-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
              Why create an account?
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Save your favorite items</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>View your order history</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Reorder with one click</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>Get personalized recommendations</span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
