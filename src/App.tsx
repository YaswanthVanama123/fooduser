import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { UserProvider } from './context/UserContext';
import TableSelection from './pages/TableSelection';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import Favorites from './pages/Favorites';
import ChangePassword from './pages/ChangePassword';
import Settings from './pages/Settings';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { restaurant, loading, error, refreshRestaurant } = useRestaurant();

  if (loading) {
    return <Loading message="Loading restaurant..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Restaurant Not Found"
        message={error}
        onRetry={refreshRestaurant}
      />
    );
  }

  if (!restaurant) {
    return (
      <ErrorMessage
        title="Restaurant Not Available"
        message="Unable to load restaurant information. Please try again."
        onRetry={refreshRestaurant}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<TableSelection />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/order/:orderId" element={<OrderTracking />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <RestaurantProvider>
          <UserProvider>
            <SocketProvider>
              <CartProvider>
                <AppContent />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </CartProvider>
            </SocketProvider>
          </UserProvider>
        </RestaurantProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
