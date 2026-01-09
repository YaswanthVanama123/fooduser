import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Home, ArrowLeft, Menu as MenuIcon, User, LogOut, ClipboardList, Clock, Star, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useUser } from '../context/UserContext';
import SimpleAuthModal from './SimpleAuthModal';
import Badge from './ui/Badge';
import authApi from '../api/auth.api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, tableNumber } = useCart();
  const { restaurant } = useRestaurant();
  const { user, isAuthenticated, login, register, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isHomePage = location.pathname === '/';
  const isMenuPage = location.pathname === '/menu';
  const isCartPage = location.pathname === '/cart';
  const isOrderTrackingPage = location.pathname.startsWith('/order/');

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  // Fetch active order when user is authenticated
  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (isAuthenticated) {
        try {
          const response = await authApi.getActiveOrder();
          if (response.success && response.data) {
            setActiveOrder(response.data);
          } else {
            setActiveOrder(null);
          }
        } catch (error) {
          console.error('Failed to fetch active order:', error);
          setActiveOrder(null);
        }
      } else {
        setActiveOrder(null);
      }
    };

    fetchActiveOrder();
    // Re-fetch every 30 seconds if authenticated
    const interval = isAuthenticated ? setInterval(fetchActiveOrder, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Get logo URL from branding (handle both object and string formats)
  const getLogoUrl = () => {
    const logo = restaurant?.branding?.logo;
    if (!logo) return null;
    // If logo is an object, use the original URL, otherwise use as string
    return typeof logo === 'object' ? logo.original : logo;
  };

  const logoUrl = getLogoUrl();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Get user initials from username
  const getUserInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Handle dropdown menu item click
  const handleMenuClick = (path: string) => {
    setShowDropdown(false);
    navigate(path);
  };

  return (
    <header
      className="sticky top-0 z-50 shadow-xl backdrop-blur-lg bg-opacity-95"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Section - Back Button or Logo */}
          <div className="flex items-center space-x-4">
            {!isHomePage && !isMenuPage && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white"
                aria-label="Go back"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}

            {/* Restaurant Logo & Name */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => !isHomePage && navigate('/menu')}
            >
              {logoUrl ? (
                <div className="h-14 w-14 rounded-xl bg-white p-2 shadow-lg group-hover:scale-110 transition-transform">
                  <img
                    src={logoUrl}
                    alt={restaurant.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-xl bg-white bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MenuIcon className="h-8 w-8 text-white" />
                </div>
              )}

              <div>
                <h1 className="text-white text-2xl font-bold tracking-tight">
                  {restaurant?.name || 'Restaurant'}
                </h1>
                {tableNumber && (
                  <div className="flex items-center space-x-1">
                    <span className="text-white text-sm opacity-90 font-medium">
                      Table {tableNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Navigation */}
          <div className="flex items-center space-x-3">
            {!isMenuPage && !isHomePage && (
              <button
                onClick={() => navigate('/menu')}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white font-medium"
              >
                <Home className="h-5 w-5" />
                <span>Menu</span>
              </button>
            )}

            {/* Track Order Button - Show when user has active order and not already on tracking page */}
            {isAuthenticated && activeOrder && !isOrderTrackingPage && (
              <button
                onClick={() => navigate(`/order/${activeOrder._id}`)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white font-medium animate-pulse"
              >
                <ClipboardList className="h-5 w-5" />
                <span className="hidden sm:inline">Track Order</span>
              </button>
            )}

            {!isCartPage && (
              <button
                onClick={() => navigate('/cart')}
                className="relative p-3 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all group"
                aria-label="View cart"
              >
                <ShoppingCart className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all group"
                  aria-label="User menu"
                >
                  <div className="h-10 w-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                    {getUserInitials()}
                  </div>
                  <span className="hidden md:inline-block text-white font-medium max-w-[120px] truncate">
                    {user.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-600">Customer</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => handleMenuClick('/order-history')}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <Clock className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900">Order History</span>
                      </button>

                      <button
                        onClick={() => handleMenuClick('/favorites')}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <Star className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900">My Favorites</span>
                      </button>

                      <button
                        onClick={() => handleMenuClick('/profile')}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <Settings className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900">Settings</span>
                      </button>

                      <div className="my-2 border-t border-gray-200"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white font-medium"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator for cart */}
      {cartItemCount > 0 && !isCartPage && (
        <div className="h-1 bg-white bg-opacity-20">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${Math.min((cartItemCount / 10) * 100, 100)}%` }}
          />
        </div>
      )}

      {/* Simple Auth Modal */}
      <SimpleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
      />
    </header>
  );
};

export default Header;
