import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User,
  LogOut,
  Heart,
  Clock,
  Settings,
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import { useUser } from '../context/UserContext';
import { useRestaurant } from '../context/RestaurantContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useUser();
  const { restaurant } = useRestaurant();

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Not Logged In
            </h3>
            <p className="text-gray-600 mb-6">
              Please log in to view your profile
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              Go to Login
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton to="/menu" label="Back to Menu" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h2>
              </CardHeader>

              <CardBody className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-600">Customer</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Favorites</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.preferences?.favoriteItems?.length || 0}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Preferences Card */}
            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-900">
                  Dietary Preferences
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary Restrictions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences?.dietaryRestrictions &&
                      user.preferences.dietaryRestrictions.length > 0 ? (
                        user.preferences.dietaryRestrictions.map((restriction) => (
                          <Badge key={restriction} variant="info">
                            {restriction}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No dietary restrictions set
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergens
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {user.preferences?.allergens &&
                      user.preferences.allergens.length > 0 ? (
                        user.preferences.allergens.map((allergen) => (
                          <Badge key={allergen} variant="danger">
                            {allergen}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No allergens set</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/order-history')}
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Order History
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/favorites')}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  My Favorites
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/change-password')}
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </Button>
              </CardBody>
            </Card>

            {/* Logout Card */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-100">
              <CardBody>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Ready to leave?
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  You'll be logged out from your account.
                </p>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
