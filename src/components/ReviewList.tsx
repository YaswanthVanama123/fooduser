import React from 'react';
import { User, ThumbsUp, Clock, Edit2, Trash2 } from 'lucide-react';
import RatingStars from './ui/RatingStars';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useRestaurant } from '../context/RestaurantContext';

interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  helpfulCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  onHelpful?: (reviewId: string) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  currentUserId,
  onEdit,
  onDelete,
  onHelpful,
}) => {
  const { restaurant } = useRestaurant();
  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const isEdited = (review: Review) => {
    return review.updatedAt !== review.createdAt;
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gray-100"
        >
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-600">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const isOwnReview = currentUserId === review.user._id;

        return (
          <div
            key={review._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {review.user.firstName.charAt(0)}
                  {review.user.lastName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    {review.user.firstName} {review.user.lastName}
                    {isOwnReview && (
                      <Badge variant="info" className="ml-2">
                        You
                      </Badge>
                    )}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(review.createdAt)}
                      {isEdited(review) && ' (edited)'}
                    </span>
                  </div>
                </div>
              </div>

              {isOwnReview && (onEdit || onDelete) && (
                <div className="flex items-center space-x-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(review._id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Edit review"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(review._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              {review.comment}
            </p>

            {onHelpful && (
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onHelpful(review._id)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  disabled={isOwnReview}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful</span>
                  {review.helpfulCount !== undefined &&
                    review.helpfulCount > 0 && (
                      <span className="font-medium">
                        ({review.helpfulCount})
                      </span>
                    )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
