import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, MapPin, Armchair, Lightbulb, CheckCircle, Check, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { useTables } from '../hooks';
import { Table } from '../types';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { TableGridSkeleton } from '../components/ui/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SimpleAuthModal from '../components/SimpleAuthModal';
import authApi from '../api/auth.api';

const TableSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setTable } = useCart();
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant();
  const { connectToRestaurant } = useSocket();
  const { isAuthenticated, user, login, register } = useUser();
  const { tables, loading, error, refetch } = useTables();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (restaurant) {
      connectToRestaurant(restaurant._id);
    }
  }, [restaurant]);

  // Fetch active order when user is authenticated
  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (isAuthenticated) {
        try {
          const response = await authApi.getActiveOrder();
          if (response.success && response.data) {
            setActiveOrder(response.data);
            // Show notification that user has an active order
            toast.success(`You have an active order at Table ${response.data.tableNumber}!`, {
              style: {
                background: restaurant?.branding?.primaryColor || '#6366f1',
                color: '#fff',
              },
              duration: 5000,
            });
          }
        } catch (error) {
          console.error('Failed to fetch active order:', error);
        }
      }
    };

    fetchActiveOrder();
  }, [isAuthenticated, restaurant]);

  const handleTableSelect = (table: Table) => {
    // Check if user has an active order for this table
    if (activeOrder && activeOrder.tableId._id === table._id) {
      // User has an active order for this table - take them to order tracking
      toast.success(`Viewing your order from Table ${table.tableNumber}!`, {
        style: {
          background: restaurant?.branding?.primaryColor || '#6366f1',
          color: '#fff',
        },
      });
      navigate(`/order/${activeOrder._id}`);
      return;
    }

    // Check if table is occupied by someone else
    if (table.isOccupied) {
      toast.error('This table is currently occupied', {
        icon: '🚫',
      });
      return;
    }

    // Normal table selection for menu browsing
    setSelectedTableId(table._id);
    setTable(table._id, table.tableNumber);
    toast.success(`Table ${table.tableNumber} selected!`, {
      style: {
        background: restaurant?.branding?.primaryColor || '#6366f1',
        color: '#fff',
      },
    });

    setTimeout(() => {
      navigate('/menu');
    }, 800);
  };

  if (restaurantLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <SEO
          title="Select Table"
          description="Choose your table to start browsing our menu and placing your order"
        />

        {/* Hero Section */}
        <div
          className="relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-10" />
          <div className="absolute inset-0 bg-grid-white/[0.05]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
                Loading...
              </h1>
              <p className="text-xl sm:text-2xl text-white opacity-95 mb-8 font-medium">
                Welcome to a delightful dining experience
              </p>
            </div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              <path
                d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
                fill="#F9FAFB"
              />
            </svg>
          </div>
        </div>

        {/* Tables Section with Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge variant="primary" size="lg" className="mb-4">
              <Armchair className="h-4 w-4 mr-2" />
              Available Tables
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Choose Your Table
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Select an available table to start browsing our menu and placing your order
            </p>
          </div>

          <TableGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (restaurantError) {
    return <ErrorMessage title="Restaurant Error" message={restaurantError} />;
  }

  if (error) {
    return <ErrorMessage title="Error Loading Tables" message={error} onRetry={refetch} />;
  }

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO
        title="Select Table"
        description="Choose your table to start browsing our menu and placing your order"
      />

      {/* Hero Section */}
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10">
          <div className="text-center">
            {/* Logo */}
            {restaurant?.branding?.logo && (
              <div className="mb-8 flex justify-center">
                <div className="bg-white p-6 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform">
                  <img
                    src={restaurant.branding.logo}
                    alt={restaurant.name}
                    className="h-24 w-24 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Restaurant Name */}
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
              {restaurant?.name}
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-white opacity-95 mb-8 font-medium">
              Welcome to a delightful dining experience
            </p>

            {/* Selection Instruction */}
            <div className="inline-flex items-center space-x-3 bg-white bg-opacity-20 backdrop-blur-lg px-8 py-4 rounded-2xl border-2 border-white border-opacity-30">
              <Users className="h-8 w-8 text-white" />
              <span className="text-white font-semibold text-lg">
                Please select your table to begin
              </span>
            </div>

            {/* Login Button - Show when not authenticated */}
            {!isAuthenticated && (
              <div className="mt-6 relative z-50">
                <button
                  onClick={() => {
                    console.log('Login button clicked!');
                    setShowAuthModal(true);
                  }}
                  className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                  type="button"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Already have an order? Login here</span>
                </button>
              </div>
            )}

            {/* Active Order Info - Show when authenticated and has order */}
            {isAuthenticated && activeOrder && (
              <div className="mt-6 relative z-50">
                <button
                  onClick={() => navigate(`/order/${activeOrder._id}`)}
                  className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 animate-pulse cursor-pointer"
                  type="button"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>View Your Active Order (Table {activeOrder.tableNumber})</span>
                </button>
              </div>
            )}

            {/* Logged In Info - Show when authenticated but no active order */}
            {isAuthenticated && !activeOrder && (
              <div className="mt-6 relative z-50">
                <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-lg px-6 py-3 rounded-xl border-2 border-white border-opacity-30">
                  <CheckCircle className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">
                    Welcome back, {user?.username}!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </div>

      {/* Tables Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="primary" size="lg" className="mb-4">
            <Armchair className="h-4 w-4 mr-2" />
            Available Tables
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Choose Your Table
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select an available table to start browsing our menu and placing your order
          </p>
        </div>

        {/* Tables Grid */}
        {tables.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardBody className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Tables Available
              </h3>
              <p className="text-gray-600">
                All tables are currently occupied. Please check back in a moment.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => {
              // Check if this table has user's active order
              const isUserTable = activeOrder && activeOrder.tableId._id === table._id;
              const isClickable = !table.isOccupied || isUserTable;

              return (
                <Card
                  key={table._id}
                  hover={isClickable}
                  onClick={() => handleTableSelect(table)}
                  className={`relative ${
                    isClickable ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                  } ${
                    selectedTableId === table._id ? 'ring-4 ring-offset-2' : ''
                  }`}
                  style={{
                    ringColor: selectedTableId === table._id ? primaryColor : 'transparent',
                  }}
                >
                  <CardBody className="p-8 text-center">
                    {/* Table Icon */}
                    <div
                      className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                      style={{
                        background: table.isOccupied && !isUserTable
                          ? '#E5E7EB'
                          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      }}
                    >
                      <Users className={`h-10 w-10 ${table.isOccupied && !isUserTable ? 'text-gray-400' : 'text-white'}`} />
                    </div>

                    {/* Table Number */}
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      Table {table.tableNumber}
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-center space-x-2 text-gray-600 mb-3">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {table.capacity} {table.capacity === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>

                    {/* Location */}
                    {table.location && (
                      <div className="flex items-center justify-center space-x-1 text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{table.location}</span>
                      </div>
                    )}

                    {/* Occupied Badge or Your Order Badge */}
                    {table.isOccupied && (
                      <div className="absolute top-3 right-3">
                        {isUserTable ? (
                          <Badge variant="success" size="sm">
                            Your Order
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="sm">
                            Occupied
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Selected Checkmark */}
                    {selectedTableId === table._id && (
                      <div className="absolute top-3 left-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100">
            <CardBody className="p-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    How it works
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Select your table number from the available options above</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Browse our delicious menu and add items to your cart</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Place your order and track it in real-time</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Enjoy your meal when it arrives at your table!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Simple Auth Modal */}
      <SimpleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
      />
    </div>
  );
};

export default TableSelection;
