import React from 'react';
import { cn } from '../../lib/cn.ts';

const variants = {
  primary: 'bg-violet text-on-primary shadow-sm hover:brightness-95',
  ink: 'bg-ink text-on-primary shadow-sm hover:bg-[#2a2a42]',
  outline:
    'bg-surface-canvas text-text-primary border border-border-hairline hover:bg-surface-subtle',
  accent: 'bg-coral text-on-primary shadow-sm hover:brightness-95',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary',
} as const;

const sizes = {
  sm: 'h-9 px-3.5 text-xs gap-1.5 min-h-11 sm:min-h-9',
  md: 'h-10 px-4 text-sm gap-2 min-h-11 sm:min-h-10',
  lg: 'h-12 px-6 text-[15px] gap-2',
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', disabled, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold select-none whitespace-nowrap',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
