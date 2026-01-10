import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authApi from '../api/auth.api';
import { apiClient } from '../api/client';

// User type - Simplified to username only
export interface User {
  _id: string;
  username: string;
  restaurantId: string;
  createdAt: string;
}

// UserContext interface
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => void;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const cachedUser = localStorage.getItem('customer');
      const token = localStorage.getItem('customerToken');

      if (cachedUser && token) {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
      } else {
        // Clear incomplete auth data
        localStorage.removeItem('customer');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerUsername');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('customer');
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerId');
      localStorage.removeItem('customerUsername');
    } finally {
      setIsLoading(false);
    }
  };

  // Login with username only
  const login = async (username: string) => {
    try {
      const response = await authApi.login({ username });

      if (response.success) {
        const { customer, accessToken, refreshToken } = response.data;

        // Save user data and JWT tokens
        localStorage.setItem('customer', JSON.stringify(customer));
        localStorage.setItem('customerToken', accessToken);
        localStorage.setItem('customerRefreshToken', refreshToken);
        localStorage.setItem('customerId', customer._id);
        localStorage.setItem('customerUsername', customer.username);

        setUser(customer);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register with username only
  const register = async (username: string) => {
    try {
      const response = await authApi.register({ username });

      if (response.success) {
        const { customer, accessToken, refreshToken } = response.data;

        // Save user data and JWT tokens
        localStorage.setItem('customer', JSON.stringify(customer));
        localStorage.setItem('customerToken', accessToken);
        localStorage.setItem('customerRefreshToken', refreshToken);
        localStorage.setItem('customerId', customer._id);
        localStorage.setItem('customerUsername', customer.username);

        setUser(customer);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerRefreshToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerUsername');
    localStorage.removeItem('fcmToken'); // Clear FCM token on logout
    setUser(null);
  };

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
