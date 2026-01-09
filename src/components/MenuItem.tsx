import React from 'react';
import { Leaf, Wheat, Clock, Star } from 'lucide-react';
import { MenuItem as MenuItemType } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import Card from './ui/Card';
import Badge from './ui/Badge';
import RatingStars from './ui/RatingStars';

interface MenuItemProps {
  item: MenuItemType;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onClick }) => {
  const { restaurant } = useRestaurant();
  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Get image URL handling both old and new formats
  const getImageUrl = (item: MenuItemType): string | null => {
    const imagePath = item.images?.original || item.image;
    if (!imagePath) return null;

    // If already a full URL, use as-is
    if (imagePath.startsWith('http')) return imagePath;

    // Otherwise, prepend backend URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  const imageUrl = getImageUrl(item);

  return (
    <Card hover onClick={item.isAvailable ? onClick : undefined} className="overflow-hidden">
      {/* Image Section */}
      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}

        {/* Dietary Badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {item.isVegetarian && (
            <div className="bg-green-500 text-white p-2 rounded-full shadow-lg" title="Vegetarian">
              <Leaf className="h-4 w-4" />
            </div>
          )}
          {item.isVegan && (
            <div className="bg-green-700 text-white p-2 rounded-full shadow-lg" title="Vegan">
              <Leaf className="h-4 w-4" />
            </div>
          )}
          {item.isGlutenFree && (
            <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg" title="Gluten-Free">
              <Wheat className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Popular Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="warning" size="sm" className="shadow-lg">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Popular
          </Badge>
        </div>

        {/* Not Available Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-2xl">
              Not Available
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">
          {item.name}
        </h3>

        {/* Ratings */}
        {item.averageRating !== undefined && item.totalReviews !== undefined && item.totalReviews > 0 && (
          <div className="mb-3">
            <RatingStars
              rating={item.averageRating}
              size="sm"
              showCount={true}
              count={item.totalReviews}
            />
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Price and Time Row */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <div
              className="text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              {formatPrice(item.price)}
            </div>
            {item.customizationOptions && item.customizationOptions.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                + Customizable
              </p>
            )}
          </div>

          {item.preparationTime && (
            <div className="flex items-center space-x-1 text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{item.preparationTime} min</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MenuItem;
