import { useState, useEffect } from 'react';
import { tablesApi } from '../api';
import { Table } from '../types';

/**
 * Custom hook to fetch and manage tables
 */
export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return {
    tables,
    loading,
    error,
    refetch: fetchTables,
  };
};
