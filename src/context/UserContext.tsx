import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authApi from '../api/auth.api';
import { apiClient } from '../api/client';

// User type
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: {
    dietaryRestrictions?: string[];
    allergens?: string[];
    favoriteItems?: string[];
    notifications?: {
      email: boolean;
      push: boolean;
    };
    language?: string;
    theme?: 'light' | 'dark';
  };
  createdAt: string;
}

// UserContext interface
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
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
      const token = localStorage.getItem('userToken');
      if (token) {
        // Set auth header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user data
        const response = await authApi.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        } else {
          // Token invalid, clear it
          localStorage.removeItem('userToken');
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('userToken');
      delete apiClient.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      if (response.success) {
        const { token, user: userData } = response.data;

        // Save token
        localStorage.setItem('userToken', token);

        // Set auth header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Set user data
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register
  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      const response = await authApi.register(data);

      if (response.success) {
        const { token, user: userData } = response.data;

        // Save token
        localStorage.setItem('userToken', token);

        // Set auth header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Set user data
        setUser(userData);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and user data
      localStorage.removeItem('userToken');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authApi.updateProfile(data);

      if (response.success) {
        setUser(response.data);
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
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
