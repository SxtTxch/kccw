import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0-5
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 'md', 
  interactive = false, 
  onRatingChange,
  showValue = false 
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      let starClass = 'text-gray-300';
      
      if (i <= fullStars) {
        starClass = 'text-yellow-400';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass = 'text-yellow-400';
      }

      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} ${starClass} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
          fill={i <= fullStars || (i === fullStars + 1 && hasHalfStar) ? 'currentColor' : 'none'}
          onClick={() => handleStarClick(i)}
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
