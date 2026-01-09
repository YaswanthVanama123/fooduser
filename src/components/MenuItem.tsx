import React from 'react';
import { Leaf, Wheat, Clock, Star, Sparkles } from 'lucide-react';
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
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

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
    <Card
      hover
      onClick={item.isAvailable ? onClick : undefined}
      className="overflow-hidden group transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-6xl sm:text-7xl">🍽️</span>
          </div>
        )}

        {/* Dietary Badges */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col space-y-2">
          {item.isVegetarian && (
            <div className="bg-green-500 text-white p-1 rounded-full transition-transform" title="Vegetarian">
              <Leaf className="h-3.5 w-3.5" />
            </div>
          )}
          {item.isVegan && (
            <div className="bg-green-700 text-white p-1 rounded-full transition-transform" title="Vegan">
              <Leaf className="h-3.5 w-3.5" />
            </div>
          )}
          {item.isGlutenFree && (
            <div className="bg-amber-500 text-white p-1 rounded-full transition-transform" title="Gluten-Free">
              <Wheat className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Popular Badge */}
        {item.averageRating && item.averageRating >= 4.5 && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <Badge variant="warning" size="sm" className="backdrop-blur-sm bg-yellow-400/90 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1 fill-current" />
              Popular
            </Badge>
          </div>
        )}

        {/* Not Available Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-2xl">
              Not Available
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="font-semibold text-lg sm:text-xl text-gray-900 mb-2 line-clamp-1 transition-all">
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
          <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Price and Time Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div>
            <div
              className="text-xl sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {formatPrice(item.price)}
            </div>
            {item.customizationOptions && item.customizationOptions.length > 0 && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Customizable
              </p>
            )}
          </div>

          {item.preparationTime && (
            <div className="flex items-center space-x-1 text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">{item.preparationTime} min</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MenuItem;
