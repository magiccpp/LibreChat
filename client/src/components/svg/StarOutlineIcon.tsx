import React from 'react';
import { cn } from '~/utils';

type IconProps = {
  className?: string;
  size?: string;
};

const OutlineStarIcon = React.forwardRef<SVGSVGElement, IconProps>((props: IconProps, ref) => {
  const { className = 'icon-md', size = '1.2em' } = props;
  return (
    <svg
      ref={ref}
      fill="none" // No fill to create an outline
      stroke="currentColor" // Stroke to represent the outline
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height={size}
      width={size}
      className={cn(className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      />
    </svg>
  );
});


export default OutlineStarIcon;
