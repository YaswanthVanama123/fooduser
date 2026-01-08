import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import Button from './ui/Button';
import TextArea from './ui/TextArea';
import RatingStars from './ui/RatingStars';
import { useRestaurant } from '../context/RestaurantContext';

interface ReviewFormProps {
  menuItemId: string;
  menuItemName: string;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  menuItemId,
  menuItemName,
  onSubmit,
  onCancel,
}) => {
  const { restaurant } = useRestaurant();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const primaryColor = restaurant?.branding?.primaryColor || '#6366f1';
  const secondaryColor = restaurant?.branding?.secondaryColor || '#8b5cf6';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({ rating, comment: comment.trim() });
      setRating(0);
      setComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Rate {menuItemName}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          How would you rate this item?
        </p>
        <div className="flex items-center space-x-4">
          <RatingStars
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          {rating > 0 && (
            <span className="text-sm font-medium text-gray-700">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      <div>
        <TextArea
          label="Your Review"
          placeholder="Share your experience with this item..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          showCharCount
          error={error}
          required
        />
      </div>

      <div className="flex items-center space-x-3">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={rating === 0 || !comment.trim()}
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Review
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
