import { useState, useEffect, useRef, useCallback } from 'react';
import { categoriesApi } from '../api';
import { Category } from '../types';

/**
 * Custom hook to fetch and manage categories
 * Optimized to prevent duplicate API calls during React StrictMode
 */
export const useCategories = (includeInactive = false) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent duplicate API calls
  const hasFetchedCategories = useRef(false);
  const previousIncludeInactive = useRef(includeInactive);

  const fetchCategories = useCallback(async () => {
    // Check if includeInactive changed - if so, reset the guard
    if (includeInactive !== previousIncludeInactive.current) {
      hasFetchedCategories.current = false;
      previousIncludeInactive.current = includeInactive;
    }

    // Prevent duplicate calls
    if (hasFetchedCategories.current) return;
    hasFetchedCategories.current = true;

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
      hasFetchedCategories.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Manual refetch function (resets the guard)
  const refetch = useCallback(() => {
    hasFetchedCategories.current = false;
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch,
  };
};
