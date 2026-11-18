import React from 'react';
import { cn } from '../../lib/cn.ts';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-11 w-full rounded-full border border-border-hairline bg-surface-canvas px-4',
        'text-sm text-text-primary placeholder:text-text-muted',
        'transition-[border-color,box-shadow] duration-150',
        'focus-visible:outline-none focus-visible:border-violet',
        'focus-visible:shadow-[0_0_0_3px_rgba(101,89,245,0.18)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
