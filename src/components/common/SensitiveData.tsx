import { useState } from 'react';

interface SensitiveDataProps {
  value: string | number;
  prefix?: string;
  className?: string;
  blurLevel?: 'light' | 'medium' | 'heavy';
}

export function SensitiveData({
  value,
  prefix = '₹',
  className = '',
  blurLevel = 'medium',
}: SensitiveDataProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const blurLevels = {
    light: 'blur-[3px]',
    medium: 'blur-[6px]',
    heavy: 'blur-[10px]',
  };

  const displayValue =
    typeof value === 'number'
      ? value.toLocaleString('en-IN')
      : value;

  return (
    <div
      className="relative inline-block cursor-pointer select-none"
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
    >
      <div
        className={`
          transition-all duration-300 ease-out
          transform-gpu
          ${className}
          ${
            isRevealed
              ? 'blur-0 scale-100'
              : `${blurLevels[blurLevel]} scale-95 opacity-70`
          }
          hover:scale-105
        `}
        style={{
          transform: isRevealed
            ? 'perspective(1000px) rotateX(4deg) rotateY(-4deg)'
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {prefix && <span className="mr-1">{prefix}</span>}
        {displayValue}
      </div>
    </div>
  );
}
