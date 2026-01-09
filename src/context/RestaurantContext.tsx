import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { extractSubdomain } from '../utils/subdomain';
import { restaurantApi } from '../api';

export interface RestaurantBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  fontFamily?: string;
  theme?: 'light' | 'dark';
}

export interface Restaurant {
  _id: string;
  subdomain: string;
  name: string;
  email?: string;
  phone?: string;
  branding: RestaurantBranding;
  isActive: boolean;
}

interface RestaurantContextType {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  subdomain: string | null;
  refreshRestaurant: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const isFetchingRef = useRef(false); // Prevent concurrent fetches

  const fetchRestaurant = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('Restaurant fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const { subdomain: detectedSubdomain } = extractSubdomain();
      setSubdomain(detectedSubdomain);

      if (!detectedSubdomain) {
        setError('No restaurant subdomain detected. Please access via restaurant URL (e.g., pizzahut.patlinks.com)');
        setLoading(false);
        return;
      }

      // Fetch restaurant info using centralized API service
      const response = await restaurantApi.getInfo();

      if (response.success && response.data) {
        // Map the public API response to Restaurant format
        const restaurantData: Restaurant = {
          _id: response.data.restaurantId,
          subdomain: response.data.subdomain,
          name: response.data.name,
          branding: {
            logo: response.data.logo?.original || response.data.logo?.medium || response.data.branding?.logo,
            primaryColor: response.data.branding?.primaryColor || '#6366f1',
            secondaryColor: response.data.branding?.secondaryColor || '#8b5cf6',
            accentColor: response.data.branding?.accentColor || '#ec4899',
            fontFamily: response.data.branding?.fontFamily || 'Inter',
            theme: response.data.branding?.theme || 'light',
          },
          isActive: true,
        };

        setRestaurant(restaurantData);
        applyBranding(restaurantData.branding);

        // Store restaurantId for API calls
        localStorage.setItem('restaurantId', restaurantData._id);
        localStorage.setItem('restaurantName', restaurantData.name);
      } else {
        setError('Restaurant not found or inactive');
      }
    } catch (err: any) {
      console.error('Error fetching restaurant:', err);
      setError(err.response?.data?.message || 'Failed to load restaurant information');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const applyBranding = (branding: RestaurantBranding) => {
    const root = document.documentElement;

    // Apply CSS variables for dynamic theming
    root.style.setProperty('--color-primary', branding.primaryColor || '#6366f1');
    root.style.setProperty('--color-secondary', branding.secondaryColor || '#8b5cf6');
    root.style.setProperty('--color-accent', branding.accentColor || '#ec4899');

    if (branding.fontFamily) {
      root.style.setProperty('--font-family', branding.fontFamily);
    }

    // Apply theme class
    if (branding.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []); // Empty dependency array - only run on mount

  const refreshRestaurant = useCallback(async () => {
    await fetchRestaurant();
  }, [fetchRestaurant]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        loading,
        error,
        subdomain,
        refreshRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};
