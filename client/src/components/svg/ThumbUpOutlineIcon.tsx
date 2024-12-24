import React from 'react';
import { cn } from '~/utils';

type IconProps = {
  className?: string;
  size?: string;
};

const ThumbUpOutlineIcon = React.forwardRef<SVGSVGElement, IconProps>((props: IconProps, ref) => {
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
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  );
});

export default ThumbUpOutlineIcon;