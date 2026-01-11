/**
 * Subdomain Detection Utility
 * Extracts restaurant subdomain from hostname for multi-tenant routing
 * REJECTS "admin" prefix for security
 */

export interface SubdomainInfo {
  subdomain: string | null;
  isLocal: boolean;
}

/**
 * Extract subdomain from current hostname
 * User app should NOT have "admin" prefix
 * Examples:
 *   - pizzahut.patlinks.com → pizzahut ✅
 *   - pizzahut.localhost:5174 → pizzahut ✅
 *   - admin.pizzahut.localhost:5174 → ERROR ❌
 *   - localhost:5174 → null
 */
export const extractSubdomain = (): SubdomainInfo => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Check if local development
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // SECURITY: Reject "admin" prefix
  if (parts[0] === 'admin') {
    console.error('⚠️ User app accessed with "admin" prefix:', hostname);
    throw new Error('Invalid URL: User app should not have "admin" prefix. Use admin.{restaurant}.localhost:5175 for admin app.');
  }

  // For local development: subdomain.localhost or just localhost
  if (isLocal) {
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      return { subdomain: parts[0], isLocal: true };
    }

    // Check for manual subdomain override in localStorage for dev
    const devSubdomain = localStorage.getItem('dev_subdomain');
    if (devSubdomain) {
      console.log('Using dev subdomain from localStorage:', devSubdomain);
      return { subdomain: devSubdomain, isLocal: true };
    }

    return { subdomain: null, isLocal: true };
  }

  // Production: subdomain.domain.com (but not admin.subdomain.domain.com)
  if (parts.length >= 3) {
    return { subdomain: parts[0], isLocal: false };
  }

  return { subdomain: null, isLocal: false };
};

/**
 * Get API base URL based on subdomain
 */
export const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const { subdomain, isLocal } = extractSubdomain();

  if (!subdomain) {
    console.warn('No subdomain detected. Using base API URL.');
    return `${baseUrl}/api`;
  }

  // For local development with subdomain
  if (isLocal) {
    // Use x-restaurant-id header instead of subdomain for localhost
    return `${baseUrl}/api`;
  }

  // Production: use subdomain in URL
  const protocol = window.location.protocol;
  const domain = import.meta.env.VITE_API_DOMAIN || 'patlinks.com';
  const port = import.meta.env.VITE_API_PORT || '';
  const portStr = port ? `:${port}` : '';

  return `${protocol}//${subdomain}.${domain}${portStr}/api`;
};

/**
 * Get Socket.io URL with restaurant namespace
 */
export const getSocketUrl = (restaurantId: string): string => {
  const baseUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  return `${baseUrl}/restaurant/${restaurantId}`;
};

/**
 * Check if app has valid subdomain
 */
export const hasValidSubdomain = (): boolean => {
  const { subdomain } = extractSubdomain();
  return subdomain !== null && subdomain.length > 0;
};

/**
 * Set development subdomain (for testing without DNS)
 */
export const setDevSubdomain = (subdomain: string): void => {
  localStorage.setItem('dev_subdomain', subdomain);
  window.location.reload();
};

/**
 * Clear development subdomain
 */
export const clearDevSubdomain = (): void => {
  localStorage.removeItem('dev_subdomain');
  window.location.reload();
};
