import React, { useState } from 'react';
import { cn } from '~/utils';
import { StarIcon, StarOutlineIcon } from '~/components/svg';

const StarRating = ({ rating, onRating }) => {
  const [hoverRating, setHoverRating] = useState(null);
  const [outlineOnly, setOutlineOnly] = useState(false);

  const handleMouseMove = (index, event) => {
    const { left, width } = event.target.getBoundingClientRect();
    const mouseX = event.clientX;
    const isHalf = mouseX < left + width / 2;
    setHoverRating(index + (isHalf ? 0.5 : 1));
    setOutlineOnly(true);
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
    setOutlineOnly(false);
  };

  const handleClick = (index) => {
    onRating(index);
    setOutlineOnly(false);
  };

  const renderStar = (index, outlineOnly) => {
    const isFull = (hoverRating || rating) >= index + 1;
    const isHalf = (hoverRating || rating) >= index + 0.5 && !isFull;

    return (
      <span
        key={index}
        onMouseMove={(event) => handleMouseMove(index, event)}
        onClick={() => handleClick(index + (isHalf ? 0.5 : 1))}
        onMouseLeave={handleMouseLeave}
        className="star"
      >
        {isFull ? (
          (outlineOnly ? <StarOutlineIcon className="text-yellow-500" /> : <StarIcon className="text-yellow-500" />)
        ) : isHalf ? (
          (outlineOnly ? <HalfStarOutlineIcon className="text-yellow-500" /> : <HalfStarIcon className="text-yellow-500" />)
        ) : (
          <StarIcon className="text-gray-300" />
        )}
      </span>
    );
  };

  return <div className="flex">{[...Array(5)].map((_, i) => renderStar(i, outlineOnly))}</div>;
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

const HalfStarOutlineIcon = ({ className }) => (
  <svg
    fill="none" // Ensure the star is not filled
    stroke="currentColor" // Use currentColor to allow CSS classes to set the color
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
      <clipPath id="clip-half-star-outline">
        <rect x="0" y="0" width="12" height="24" /> {/* Clip half the star */}
      </clipPath>
    </defs>
    <path
      clipPath="url(#clip-half-star-outline)"
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
    />
  </svg>
);

export default StarRating;
