import React from 'react';

interface AccruelyLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'icon' | 'badge';
}

export const AccruelyLogo: React.FC<AccruelyLogoProps> = ({
  className = '',
  size = 24,
  variant = 'icon',
}) => {
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl bg-orange-600 dark:bg-orange-500 text-white shadow-xs p-1.5 ${className}`}
        style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
      >
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Main Stylized Monogram "A" with Precision Math Geometry */}
          <path
            d="M 256 86 C 245 86 237 92 231 108 L 134 394 C 128 410 138 424 158 424 L 194 424 C 208 424 216 416 219 402 L 230 354 L 282 354 L 293 402 C 296 416 304 424 318 424 L 354 424 C 374 424 384 410 378 394 L 281 108 C 275 92 267 86 256 86 Z M 256 196 L 274 290 L 238 290 Z"
            fill="#FFFFFF"
          />
          {/* Accounting Balance Precision Crossbar / Tally Matrix */}
          <rect x="176" y="274" width="160" height="32" rx="8" fill="#FED7AA" />
          {/* Accrual Precision Dot Accent */}
          <circle cx="256" cy="160" r="14" fill="#EA580C" />
          {/* Plus / Delta Balance Mark */}
          <rect x="251" y="280" width="10" height="20" rx="2" fill="#EA580C" />
          <rect x="246" y="285" width="20" height="10" rx="2" fill="#EA580C" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
      aria-label="Accruely Logo"
    >
      {/* Background Rounded Squircle */}
      <rect width="512" height="512" rx="112" fill="currentColor" />
      
      {/* Geometric A Monogram */}
      <path
        d="M 256 86 C 245 86 237 92 231 108 L 134 394 C 128 410 138 424 158 424 L 194 424 C 208 424 216 416 219 402 L 230 354 L 282 354 L 293 402 C 296 416 304 424 318 424 L 354 424 C 374 424 384 410 378 394 L 281 108 C 275 92 267 86 256 86 Z M 256 196 L 274 290 L 238 290 Z"
        fill="#FFFFFF"
      />
      
      {/* Accounting Ledger Crossbar */}
      <rect x="176" y="274" width="160" height="32" rx="8" fill="#FED7AA" />
      
      {/* Accent Point */}
      <circle cx="256" cy="160" r="14" fill="#EA580C" />
      
      {/* Plus Mark on Crossbar */}
      <rect x="251" y="280" width="10" height="20" rx="2" fill="#EA580C" />
      <rect x="246" y="285" width="20" height="10" rx="2" fill="#EA580C" />
    </svg>
  );
};
