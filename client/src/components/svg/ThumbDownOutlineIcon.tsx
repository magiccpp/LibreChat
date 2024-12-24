import React from 'react';
import { cn } from '~/utils';

type IconProps = {
  className?: string;
  size?: string;
};

const ThumbDownOutlineIcon = React.forwardRef<SVGSVGElement, IconProps>((props: IconProps, ref) => {
  const { className = 'icon-md', size = '1.2em' } = props;
  return (
    <svg
      ref={ref}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      height={size}
      width={size}
      className={cn(className)}
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
    </svg>
  );
});

export default ThumbDownOutlineIcon;