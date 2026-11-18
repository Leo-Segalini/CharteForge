import React from 'react';
import { cn } from '../../lib/cn.ts';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.25rem] border border-border-hairline/80 bg-surface-card p-6 shadow-micro',
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0',
        className,
      )}
      {...props}
    />
  );
}
