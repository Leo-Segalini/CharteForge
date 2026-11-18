import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function BrandLogo({
  variant = 'dark',
  size = 'md',
  showWordmark = true,
}: BrandLogoProps) {
  const dim = size === 'sm' ? 24 : size === 'lg' ? 40 : 28;
  const fg = variant === 'light' ? '#FFFFFF' : '#0F172A';
  const strokeMuted = variant === 'light' ? 'rgba(255,255,255,0.28)' : '#CBD5E1';
  const accent = '#C97B36';

  return (
    <span className="inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Outer precision frame */}
        <rect
          x="2"
          y="2"
          width="32"
          height="32"
          rx="7"
          fill={variant === 'light' ? '#1E293B' : '#0F172A'}
        />
        {/* Internal architectural grid hairlines */}
        <line x1="14" y1="7" x2="14" y2="29" stroke={strokeMuted} strokeWidth="1" />
        <line x1="7" y1="22" x2="29" y2="22" stroke={strokeMuted} strokeWidth="1" />
        {/* Monogram geometric C / Forge corner */}
        <path
          d="M24 11H13C11.3431 11 10 12.3431 10 14V22C10 23.6569 11.3431 25 13 25H24"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="square"
        />
        {/* Amber forge spark / registration mark */}
        <rect x="21.5" y="16" width="5" height="5" rx="1.2" fill={accent} />
      </svg>
      {showWordmark && (
        <span
          className={`font-bold tracking-tight ${
            size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg'
          }`}
          style={{ color: fg }}
        >
          CharteForge
        </span>
      )}
    </span>
  );
}
