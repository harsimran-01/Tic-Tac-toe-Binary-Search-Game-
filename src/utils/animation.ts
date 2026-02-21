
/**
 * Animation utilities for the Tic Tac Toe game
 */

export const transitions = {
  // Base transitions
  default: "transition-all duration-300 ease-out",
  fast: "transition-all duration-150 ease-out",
  slow: "transition-all duration-500 ease-out",
  
  // Enter animations
  fadeIn: "animate-fade-in",
  scaleIn: "animate-scale-in",
  slideUp: "animate-slide-up",
  
  // Exit animations
  fadeOut: "animate-fade-out",
  scaleOut: "animate-scale-out",
  
  // Continuous animations
  pulse: "animate-pulse-soft",
  float: "animate-float",
  
  // Hover effects
  hover: {
    scale: "hover:scale-105",
    brightness: "hover:brightness-105",
    shadow: "hover:shadow-md"
  },
  
  // Active effects
  active: {
    scale: "active:scale-95",
    brightness: "active:brightness-95"
  }
};

/**
 * Delayed callback function
 */
export const delayedCall = (callback: () => void, delay: number): NodeJS.Timeout => {
  return setTimeout(callback, delay);
};

/**
 * Sequential animation helper
 */
export const sequentialAnimate = (
  elements: HTMLElement[],
  className: string,
  delay: number,
  callback?: () => void
): void => {
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add(className);
      if (index === elements.length - 1 && callback) {
        setTimeout(callback, delay);
      }
    }, index * delay);
  });
};

/**
 * Animation for when a player wins
 */
export const animateWinningLine = (
  winningCombo: number[],
  boardElement: HTMLElement | null
): void => {
  if (!boardElement) return;
  
  const squares = Array.from(boardElement.querySelectorAll('.square'));
  const winningSquares = winningCombo.map(i => squares[i]);
  
  // Add winning animation to each square in the winning combination
  winningSquares.forEach((square, index) => {
    if (square) {
      // Add pulsing animation with delay based on index for sequential effect
      square.classList.add('animate-pulse-soft');
      square.classList.add('winning-square-highlight');
      
      // Add glow effect to the content
      const content = square.querySelector('.square-content');
      if (content) {
        content.classList.add('border-primary', 'border-2', 'shadow-glow');
        // Delayed flash effect for extra emphasis
        setTimeout(() => {
          content.classList.add('winning-flash');
          setTimeout(() => content.classList.remove('winning-flash'), 300);
        }, index * 150);
      }
    }
  });
};

/**
 * Reset animations
 */
export const resetAnimations = (boardElement: HTMLElement | null): void => {
  if (!boardElement) return;
  
  const squares = Array.from(boardElement.querySelectorAll('.square'));
  
  squares.forEach(square => {
    square.classList.remove('animate-pulse-soft', 'winning-square-highlight');
    const content = square.querySelector('.square-content');
    if (content) {
      content.classList.remove('border-primary', 'border-2', 'shadow-glow', 'winning-flash');
    }
  });
};
