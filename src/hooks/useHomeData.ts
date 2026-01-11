import { useState, useEffect, useCallback, useRef } from 'react';
import homeApi from '../api/home.api';

interface HomeData {
  restaurant: any;
  tables: any[];
  activeOrders: any[];
}

const CACHE_KEY = 'homePageData';
const CACHE_DURATION = 10 * 1000; // 10 seconds (matches backend cache for real-time updates)

/**
 * Custom hook for fetching home page data
 * Combines restaurant info, tables list, and active orders in a single API call
 *
 * OPTIMIZATIONS:
 * - Single API call instead of 4
 * - Light client-side caching (10s for real-time table availability)
 * - Stale-while-revalidate for instant loads
 * - Duplicate call prevention
 * - Supports multiple active orders per customer
 */
export const useHomeData = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const hasFetched = useRef(false);
  const isFetching = useRef(false);

  const fetchData = useCallback(async (skipCache = false) => {
    if (isFetching.current) {
      console.log('[useHomeData] Fetch in progress, skipping...');
      return;
    }

    try {
      isFetching.current = true;

      // Check localStorage cache (10s TTL for real-time updates)
      if (!skipCache) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached);
            const cacheAge = Date.now() - parsedCache.timestamp;

            if (cacheAge < CACHE_DURATION) {
              console.log('[useHomeData] Using cached data (age:', Math.round(cacheAge / 1000), 's)');
              setData(parsedCache.data);
              setLoading(false);
              isFetching.current = false;
              return;
            } else {
              // Stale cache - show it while revalidating
              console.log('[useHomeData] Cache stale, revalidating...');
              setData(parsedCache.data);
              setLoading(false);
            }
          } catch (err) {
            localStorage.removeItem(CACHE_KEY);
          }
        }
      }

      setLoading(true);
      setError(null);

      const response = await homeApi.getData();

      if (response.success) {
        setData(response.data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: response.data,
          timestamp: Date.now(),
        }));
        console.log('[useHomeData] Data loaded and cached');
      } else {
        throw new Error(response.message || 'Failed to fetch home data');
      }
    } catch (err: any) {
      console.error('[useHomeData] Failed to fetch:', err);
      setError(err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [fetchData]);

  return {
    restaurant: data?.restaurant,
    tables: data?.tables || [],
    activeOrders: data?.activeOrders || [],
    loading,
    error,
    refetch: () => fetchData(true),
  };
};

export default useHomeData;
