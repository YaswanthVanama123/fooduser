import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  Bell,
  Mail,
  Smartphone,
  Languages,
  Sun,
  Moon,
  Save,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Salad,
  Pizza,
  ShieldAlert,
} from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import BackButton from '../components/ui/BackButton';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { useUser } from '../context/UserContext';
import { useRestaurant } from '../context/RestaurantContext';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
  };
  dietary: {
    restrictions: string[];
    allergens: string[];
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark';
  };
}

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
  { id: 'halal', label: 'Halal', icon: '🕌' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
  { id: 'keto', label: 'Keto', icon: '🥓' },
  { id: 'paleo', label: 'Paleo', icon: '🍖' },
];

const ALLERGENS = [
  { id: 'nuts', label: 'Nuts', icon: '🥜' },
  { id: 'dairy', label: 'Dairy', icon: '🧀' },
  { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
  { id: 'eggs', label: 'Eggs', icon: '🥚' },
  { id: 'soy', label: 'Soy', icon: '🫘' },
  { id: 'wheat', label: 'Wheat', icon: '🌾' },
  { id: 'fish', label: 'Fish', icon: '🐟' },
  { id: 'sesame', label: 'Sesame', icon: '🫘' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading } = useUser();
  const { restaurant } = useRestaurant();

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
    },
    dietary: {
      restrictions: [],
      allergens: [],
    },
    preferences: {
      language: 'en',
      theme: 'light',
    },
  });

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  useEffect(() => {
    if (user) {
      // Load settings from user preferences
      setSettings({
        notifications: {
          email: user.preferences?.notifications?.email ?? true,
          push: user.preferences?.notifications?.push ?? true,
        },
        dietary: {
          restrictions: user.preferences?.dietaryRestrictions || [],
          allergens: user.preferences?.allergens || [],
        },
        preferences: {
          language: user.preferences?.language || 'en',
          theme: user.preferences?.theme || 'light',
        },
      });
    }
  }, [user]);

  const handleNotificationToggle = (type: 'email' | 'push') => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
    setHasChanges(true);
  };

  const handleDietaryToggle = (restriction: string) => {
    setSettings((prev) => {
      const restrictions = prev.dietary.restrictions.includes(restriction)
        ? prev.dietary.restrictions.filter((r) => r !== restriction)
        : [...prev.dietary.restrictions, restriction];
      return {
        ...prev,
        dietary: {
          ...prev.dietary,
          restrictions,
        },
      };
    });
    setHasChanges(true);
  };

  const handleAllergenToggle = (allergen: string) => {
    setSettings((prev) => {
      const allergens = prev.dietary.allergens.includes(allergen)
        ? prev.dietary.allergens.filter((a) => a !== allergen)
        : [...prev.dietary.allergens, allergen];
      return {
        ...prev,
        dietary: {
          ...prev.dietary,
          allergens,
        },
      };
    });
    setHasChanges(true);
  };

  const handleLanguageChange = (language: string) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language,
      },
    }));
    setHasChanges(true);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Prepare preferences data
      const preferencesData = {
        preferences: {
          notifications: settings.notifications,
          dietaryRestrictions: settings.dietary.restrictions,
          allergens: settings.dietary.allergens,
          language: settings.preferences.language,
          theme: settings.preferences.theme,
          favoriteItems: user?.preferences?.favoriteItems || [],
        },
      };

      await updateProfile(preferencesData);

      toast.success('Settings saved successfully!', {
        style: {
          background: primaryColor,
          color: '#fff',
        },
        icon: <CheckCircle className="h-5 w-5" />,
      });

      setHasChanges(false);
    } catch (error: any) {
      console.error('Settings save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings', {
        icon: <AlertCircle className="h-5 w-5" />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Settings"
        description="Manage your preferences, notifications, dietary restrictions, and more"
        keywords={['settings', 'preferences', 'notifications', 'dietary restrictions']}
      />

      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton to="/profile" label="Back to Profile" />
        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Profile', path: '/profile' },
            { label: 'Settings', path: '/settings' },
          ]}
          className="mb-6"
        />

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <SettingsIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Customize your experience</p>
        </div>

        {/* Settings Grid */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage how you receive updates about your orders
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Mail className="h-6 w-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">
                        Receive order updates via email
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('email')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      settings.notifications.email
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                        : 'bg-gray-300'
                    }`}
                    style={
                      settings.notifications.email
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          }
                        : {}
                    }
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.notifications.email ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Smartphone className="h-6 w-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-600">
                        Get instant updates on your device
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('push')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      settings.notifications.push
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                        : 'bg-gray-300'
                    }`}
                    style={
                      settings.notifications.push
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          }
                        : {}
                    }
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        settings.notifications.push ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Dietary Restrictions */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Salad className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Dietary Restrictions</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select your dietary preferences for personalized recommendations
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {DIETARY_RESTRICTIONS.map((restriction) => {
                  const isSelected = settings.dietary.restrictions.includes(
                    restriction.id
                  );
                  return (
                    <button
                      key={restriction.id}
                      onClick={() => handleDietaryToggle(restriction.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: primaryColor,
                              backgroundColor: `${primaryColor}10`,
                            }
                          : {}
                      }
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{restriction.icon}</div>
                        <p className="text-sm font-medium text-gray-900">
                          {restriction.label}
                        </p>
                        {isSelected && (
                          <CheckCircle
                            className="h-5 w-5 mx-auto mt-2"
                            style={{ color: primaryColor }}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Allergen Warnings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <ShieldAlert className="h-6 w-6 mr-3 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Allergen Warnings</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select allergens to avoid for safety alerts
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    Important: We'll alert you about menu items containing these
                    allergens. Always verify with restaurant staff for severe allergies.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ALLERGENS.map((allergen) => {
                  const isSelected = settings.dietary.allergens.includes(allergen.id);
                  return (
                    <button
                      key={allergen.id}
                      onClick={() => handleAllergenToggle(allergen.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{allergen.icon}</div>
                        <p className="text-sm font-medium text-gray-900">
                          {allergen.label}
                        </p>
                        {isSelected && (
                          <AlertCircle className="h-5 w-5 text-red-600 mx-auto mt-2" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Language Preference */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Languages className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Language Preference</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose your preferred language
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LANGUAGES.map((language) => {
                  const isSelected = settings.preferences.language === language.code;
                  return (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: primaryColor,
                              backgroundColor: `${primaryColor}10`,
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{language.flag}</span>
                        <span className="font-medium text-gray-900">{language.label}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5" style={{ color: primaryColor }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Theme Preference */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Sun className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Theme Preference</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Select your preferred color theme
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Light Theme */}
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    settings.preferences.theme === 'light'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                  }`}
                  style={
                    settings.preferences.theme === 'light'
                      ? {
                          borderColor: primaryColor,
                          backgroundColor: `${primaryColor}10`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <Sun
                      className="h-8 w-8"
                      style={{
                        color:
                          settings.preferences.theme === 'light'
                            ? primaryColor
                            : '#6b7280',
                      }}
                    />
                    {settings.preferences.theme === 'light' && (
                      <CheckCircle className="h-6 w-6" style={{ color: primaryColor }} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Light Theme
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bright and vibrant interface
                  </p>
                  <div className="mt-4 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 rounded bg-white shadow"></div>
                      <div className="w-8 h-8 rounded bg-gray-300"></div>
                      <div className="w-8 h-8 rounded bg-gray-400"></div>
                    </div>
                  </div>
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    settings.preferences.theme === 'dark'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                  }`}
                  style={
                    settings.preferences.theme === 'dark'
                      ? {
                          borderColor: primaryColor,
                          backgroundColor: `${primaryColor}10`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <Moon
                      className="h-8 w-8"
                      style={{
                        color:
                          settings.preferences.theme === 'dark'
                            ? primaryColor
                            : '#6b7280',
                      }}
                    />
                    {settings.preferences.theme === 'dark' && (
                      <CheckCircle className="h-6 w-6" style={{ color: primaryColor }} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Dark Theme</h3>
                  <p className="text-sm text-gray-600">
                    Easy on the eyes in low light
                  </p>
                  <div className="mt-4 h-20 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 rounded bg-gray-700 shadow"></div>
                      <div className="w-8 h-8 rounded bg-gray-600"></div>
                      <div className="w-8 h-8 rounded bg-gray-500"></div>
                    </div>
                  </div>
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Save Settings Button */}
          {hasChanges && (
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-6 w-6 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Unsaved Changes</h3>
                      <p className="text-sm text-gray-600">
                        You have unsaved changes. Click save to apply them.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSaveSettings}
                    isLoading={isSaving}
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900">Quick Links</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Profile Information</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={() => navigate('/order-history')}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">Order History</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              <button
                onClick={() => navigate('/favorites')}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">My Favorites</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
