import React from 'react';

interface AsakoLogoProps {
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
}

export const AsakoLogo: React.FC<AsakoLogoProps> = ({
  showTagline = true,
  size = 'md',
  variant = 'dark',
  className = '',
}) => {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#0F2342]';
  const tagColor = isLight ? 'text-[#C9A34E]' : 'text-[#C9A34E]';

  const markSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const tagSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Geometric ASAKO Emblem */}
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${markSizes[size]} shrink-0`}
        aria-hidden="true"
      >
        {/* Monolithic Navy Diamond / Polygon Frame */}
        <polygon
          points="22,2 42,12 42,32 22,42 2,32 2,12"
          fill={isLight ? '#FFFFFF' : '#173B70'}
        />
        {/* Inner Cutout */}
        <polygon
          points="22,8 36,15 36,29 22,36 8,29 8,15"
          fill={isLight ? '#0F2342' : '#FFFFFF'}
        />
        {/* The 'A' Monogram Core */}
        <path
          d="M22 13L29 28H25.5L24 24.5H20L18.5 28H15L22 13Z"
          fill={isLight ? '#FFFFFF' : '#0F2342'}
        />
        {/* Metallic Gold Specular Crossbar */}
        <rect x="19.5" y="22" width="5" height="2" fill="#C9A34E" />
      </svg>

      <div className="flex flex-col">
        <span
          className={`font-heading font-extrabold tracking-tight leading-none ${titleSizes[size]} ${textColor}`}
        >
          ASAKO
        </span>
        {showTagline && (
          <span
            className={`font-body font-semibold tracking-[0.14em] uppercase leading-tight mt-1 ${tagSizes[size]} ${tagColor}`}
          >
            INNOVATE • BUILD • GROW
          </span>
        )}
      </div>
    </div>
  );
};
