import { useState, useEffect } from 'react';
import { menuApi, MenuFilters } from '../api/menu.api';
import { MenuItem } from '../types';

/**
 * Custom hook to fetch and manage menu items
 */
export const useMenu = (initialFilters?: MenuFilters) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters | undefined>(initialFilters);

  const fetchMenuItems = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [filters]);

  return {
    menuItems,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchMenuItems,
  };
};
