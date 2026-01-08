import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showCount = false,
  count,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1;
        const isFilled = value <= displayRating;
        const isPartiallyFilled = value - displayRating > 0 && value - displayRating < 1;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`${
              interactive
                ? 'cursor-pointer hover:scale-110 transition-transform'
                : 'cursor-default'
            } focus:outline-none`}
          >
            {isPartiallyFilled ? (
              <div className="relative">
                <Star className={`${sizeClasses[size]} text-gray-300`} />
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${(1 - (value - displayRating)) * 100}%` }}
                >
                  <Star
                    className={`${sizeClasses[size]} text-yellow-400`}
                    fill="currentColor"
                  />
                </div>
              </div>
            ) : (
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'text-yellow-400'
                    : interactive
                    ? 'text-gray-300 hover:text-yellow-200'
                    : 'text-gray-300'
                }`}
                fill={isFilled ? 'currentColor' : 'none'}
              />
            )}
          </button>
        );
      })}
      {showCount && count !== undefined && (
        <span className="text-sm text-gray-600 ml-2">({count})</span>
      )}
      {!showCount && (
        <span className="text-sm text-gray-600 ml-2">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
