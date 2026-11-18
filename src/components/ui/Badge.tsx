import React from 'react';
import { cn } from '../../lib/cn.ts';

const tones = {
  violet: 'bg-violet-soft text-violet border border-transparent',
  pass: 'bg-wcag-pass-subtle text-wcag-pass border border-[#A7F3D0]',
  warning: 'bg-wcag-warning-subtle text-wcag-warning border border-[#FDE68A]',
  fail: 'bg-wcag-fail-subtle text-wcag-fail border border-[#FECDD3]',
  muted: 'bg-surface-muted text-text-secondary border border-transparent',
  ochre: 'bg-[#FFF1EB] text-coral border border-transparent',
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones;
  dot?: boolean;
}

export function Badge({ className, tone = 'violet', dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        'text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && tone === 'pass' && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-wcag-pass" aria-hidden />
      )}
      {children}
    </span>
  );
}
