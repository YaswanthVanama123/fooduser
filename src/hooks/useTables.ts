import { useState, useEffect, useRef, useCallback } from 'react';
import { tablesApi } from '../api';
import { Table } from '../types';

/**
 * Custom hook to fetch and manage tables
 * Optimized to prevent duplicate API calls during React StrictMode
 */
export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent duplicate API calls (especially in React StrictMode)
  const hasFetchedTables = useRef(false);

  const fetchTables = useCallback(async () => {
    // Prevent duplicate calls
    if (hasFetchedTables.current) return;
    hasFetchedTables.current = true;

    try {
      setLoading(true);
      setError(null);

      const response = await tablesApi.getAll();

      if (response.success) {
        // Filter only active tables
        const activeTables = response.data.filter((table: Table) => table.isActive);
        setTables(activeTables);
      } else {
        setError('Failed to load tables');
      }
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(err.response?.data?.message || 'Failed to load tables');
      hasFetchedTables.current = false; // Reset on error to allow retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Manual refetch function (resets the guard)
  const refetch = useCallback(() => {
    hasFetchedTables.current = false;
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    refetch,
  };
};
