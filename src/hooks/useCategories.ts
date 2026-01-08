import { useState, useEffect } from 'react';
import { categoriesApi } from '../api';
import { Category } from '../types';

/**
 * Custom hook to fetch and manage categories
 */
export const useCategories = (includeInactive = false) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesApi.getAll(includeInactive);

      if (response.success) {
        setCategories(response.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [includeInactive]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
