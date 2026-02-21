
import React from 'react';
import { cn } from '@/lib/utils';
import { type Player } from '@/utils/gameLogic';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare?: boolean;
  index: number;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare = false, index }) => {
  const animationDelay = `${50 * index}ms`;

  return (
    <div
      className={cn(
        'square',
        value && 'square-active',
        isWinningSquare && 'winning-square animate-pulse-soft'
      )}
      onClick={value === null ? onClick : undefined}
      style={{ animationDelay }}
    >
      <div
        className={cn(
          'square-content',
          isWinningSquare && 'winning-square-content'
        )}
        style={{
          opacity: 0,
          animation: 'fade-in 0.4s ease-out forwards',
          animationDelay: `calc(${animationDelay} + 100ms)`
        }}
      >
        {value && (
          <span
            className={cn(
              value === 'X' ? 'x-mark' : 'o-mark',
              isWinningSquare && 'scale-110'
            )}
            style={{
              opacity: 0,
              animation: 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              animationDelay: `calc(${animationDelay} + 150ms)`
            }}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
};

export default Square;
