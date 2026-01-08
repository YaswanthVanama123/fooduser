import React from 'react';
import Spinner from './ui/Spinner';
import { useRestaurant } from '../context/RestaurantContext';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', fullScreen = true }) => {
  const { restaurant } = useRestaurant();

  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      {restaurant?.branding?.logo ? (
        <div className="relative">
          <img
            src={restaurant.branding.logo}
            alt={restaurant.name}
            className="h-20 w-20 object-contain animate-pulse"
          />
          <div className="absolute -bottom-2 -right-2">
            <Spinner size="md" />
          </div>
        </div>
      ) : (
        <Spinner size="xl" />
      )}
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Please wait a moment...</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
