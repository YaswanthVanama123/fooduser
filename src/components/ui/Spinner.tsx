import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color }) => {
  const { restaurant } = useRestaurant();
  const defaultColor = color || restaurant?.branding?.primaryColor || '#6366f1';

  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizes[size]}`}
      style={{
        borderColor: `${defaultColor}20`,
        borderTopColor: defaultColor,
      }}
    />
  );
};

export default Spinner;
