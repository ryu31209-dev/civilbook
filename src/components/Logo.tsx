import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="favBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="favCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <path
        d="M 82 14 H 32 C 18 14 10 24 10 38 V 62 C 10 76 18 86 32 86 H 82 L 68 70 H 36 C 30 70 26 66 26 60 V 40 C 26 34 30 30 36 30 H 68 Z"
        fill="url(#favBlue)"
      />
      <path d="M 42 42 H 76 L 64 58 H 42 Z" fill="url(#favCyan)" />
      <path d="M 42 64 H 90 L 78 80 H 42 Z" fill="url(#favBlue)" />
    </svg>
  );
};
