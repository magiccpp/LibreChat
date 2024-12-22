import React, { useState } from 'react';
import { cn } from '~/utils';
import { StarIcon } from '~/components/svg';

const StarRating = ({ rating, onRating }) => {
  const [hoverRating, setHoverRating] = useState(null);

  const handleMouseMove = (index, event) => {
    const { left, width } = event.target.getBoundingClientRect();
    const mouseX = event.clientX;
    const isHalf = mouseX < left + width / 2;
    setHoverRating(index + (isHalf ? 0.5 : 1));
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const handleClick = (index) => {
    onRating(index);
  };

  const renderStar = (index) => {
    const isFull = (hoverRating || rating) >= index + 1;
    const isHalf = (hoverRating || rating) >= index + 0.5 && !isFull;

    return (
      <span
        key={index}
        onMouseMove={(event) => handleMouseMove(index, event)}
        onClick={() => handleClick(index + 1)}
        onMouseLeave={handleMouseLeave}
        className="star"
      >
        {isFull ? (
          <StarIcon className="text-yellow-500" />
        ) : isHalf ? (
          <HalfStarIcon className="text-yellow-500" />
        ) : (
          <StarIcon className="text-gray-300" />
        )}
      </span>
    );
  };

  return <div className="flex">{[...Array(5)].map((_, i) => renderStar(i))}</div>;
};

// You need to create a HalfStarIcon similar to the StarIcon but display only half of the star
const HalfStarIcon = ({ className }) => (
  <svg
    fill="none"
    strokeWidth="2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1.2em"
    width="1.2em"
    className={cn(className)}
  >
    <defs>
      <clipPath id="clip-half-star">
        <rect x="0" y="0" width="12" height="24" />
      </clipPath>
    </defs>
    <path
      clipPath="url(#clip-half-star)"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill="currentColor"
    />
  </svg>
);

export default StarRating;
