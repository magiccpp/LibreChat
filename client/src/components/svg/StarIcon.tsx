import React from 'react';
import { cn } from '~/utils';

type IconProps = {
  className?: string;
  size?: string;
};

const StarIcon = React.forwardRef<SVGSVGElement, IconProps>((props: IconProps, ref) => {
  const { className = 'icon-md', size = '1.2em' } = props;
  return (
    <svg
      ref={ref}
      fill="none"
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
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2ZM12 5.09L9.92 9.26L9.57 9.96L8.81 10.05L4.35 10.72L7.68 13.97L8.22 14.49L8.09 15.27L7.31 19.7L11.57 17.53L12 17.3L12.43 17.53L16.69 19.7L15.91 15.27L15.78 14.49L16.32 13.97L19.65 10.72L15.19 10.05L14.43 9.96L14.08 9.26L12 5.09Z"
        fill="currentColor"
      />
    </svg>
  );
});

export default StarIcon;
