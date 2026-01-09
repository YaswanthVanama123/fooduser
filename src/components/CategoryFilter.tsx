import React from 'react';
import { Category } from '../types';
import { useRestaurant } from '../context/RestaurantContext';
import { Check } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { restaurant } = useRestaurant();
  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';

  const getButtonStyle = (isSelected: boolean) => {
    if (isSelected) {
      return {
        backgroundColor: primaryColor,
        color: '#ffffff',
      };
    }
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151',
    };
  };

  return (
    <div className="bg-gray-50 border-t border-gray-200 shadow-sm sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
          {/* All Items Button */}
          <button
            onClick={() => onSelectCategory(null)}
            className="group relative px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 flex items-center space-x-2 border"
            style={getButtonStyle(selectedCategory === null)}
          >
            {selectedCategory === null && (
              <Check className="h-4 w-4" />
            )}
            <span>All Items</span>
          </button>

          {/* Category Buttons */}
          {categories
            .filter((cat) => cat.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((category) => (
              <button
                key={category._id}
                onClick={() => onSelectCategory(category._id)}
                className="group relative px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 flex items-center space-x-2 border border-gray-200 hover:border-gray-300"
                style={getButtonStyle(selectedCategory === category._id)}
              >
                {selectedCategory === category._id && (
                  <Check className="h-4 w-4" />
                )}
                <span>{category.name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
