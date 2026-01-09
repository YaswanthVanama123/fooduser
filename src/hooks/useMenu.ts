import { useState, useEffect, useRef, useCallback } from 'react';
import { menuApi, MenuFilters } from '../api/menu.api';
import { MenuItem } from '../types';

/**
 * Custom hook to fetch and manage menu items
 * Optimized to prevent duplicate API calls during React StrictMode
 */
export const useMenu = (initialFilters?: MenuFilters) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters | undefined>(initialFilters);

  // Ref to prevent duplicate API calls
  const hasFetchedMenu = useRef(false);
  const previousFilters = useRef<MenuFilters | undefined>(initialFilters);

  const fetchMenuItems = useCallback(async () => {
    // Check if filters changed - if so, reset the guard
    if (JSON.stringify(filters) !== JSON.stringify(previousFilters.current)) {
      hasFetchedMenu.current = false;
      previousFilters.current = filters;
    }

    // Prevent duplicate calls
    if (hasFetchedMenu.current) return;
    hasFetchedMenu.current = true;

    try {
      setLoading(true);
      setError(null);

      const response = await menuApi.getAll(filters);

      if (response.success) {
        setMenuItems(response.data);
      } else {
        setError('Failed to load menu items');
      }
    } catch (err: any) {
      console.error('Error fetching menu items:', err);
      setError(err.response?.data?.message || 'Failed to load menu items');
      hasFetchedMenu.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Manual refetch function (resets the guard)
  const refetch = useCallback(() => {
    hasFetchedMenu.current = false;
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  };
};
