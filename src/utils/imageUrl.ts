/**
 * Image URL utilities for converting relative paths to absolute URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get full image URL from relative path or URL
 * @param imagePath - Relative path or full URL
 * @returns Full URL for the image
 */
export const getImageUrl = (imagePath?: string | null): string | undefined => {
  if (!imagePath) return undefined;

  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path, prepend base URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Get full image URL with fallback to placeholder
 * @param imagePath - Relative path or full URL
 * @param fallback - Fallback placeholder URL
 * @returns Full URL for the image or fallback
 */
export const getImageUrlWithFallback = (
  imagePath?: string | null,
  fallback: string = '/placeholder-food.jpg'
): string => {
  return getImageUrl(imagePath) || fallback;
};
