import React from 'react';
import { cn } from '../lib/cn.ts';
import { publicUrl } from '../lib/publicUrl.ts';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

const SIZE_MAP = {
  sm: { mark: 28, word: 'text-base' },
  md: { mark: 32, word: 'text-lg' },
  lg: { mark: 40, word: 'text-xl' },
} as const;

export function BrandLogo({
  variant = 'dark',
  size = 'md',
  showWordmark = true,
}: BrandLogoProps) {
  const { mark, word } = SIZE_MAP[size];
  const fg = variant === 'light' ? '#FFFFFF' : '#1D1D31';

  return (
    <span className="inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0">
      <img
        src={publicUrl('logo-mark.png')}
        alt=""
        width={mark}
        height={Math.round(mark * 0.4)}
        className={cn(
          'shrink-0 object-contain object-center',
          variant === 'light' && 'brightness-0 invert',
        )}
        style={{ width: mark, height: Math.round(mark * 0.45) }}
        decoding="async"
      />
      {showWordmark && (
        <span className={cn(word, 'font-extrabold tracking-tight')} style={{ color: fg }}>
          CharteForge
        </span>
      )}
    </span>
  );
}
