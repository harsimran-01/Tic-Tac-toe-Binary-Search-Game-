
import React, { useRef, useEffect } from 'react';
import Square from './Square';
import { type BoardState, type Player, WINNING_COMBINATIONS } from '@/utils/gameLogic';
import { animateWinningLine, resetAnimations } from '@/utils/animation';

interface BoardProps {
  board: BoardState;
  onClick: (index: number) => void;
  winningCombo: number[] | null;
}

const Board: React.FC<BoardProps> = ({ board, onClick, winningCombo }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Animate winning line when a player wins
  useEffect(() => {
    if (winningCombo) {
      animateWinningLine(winningCombo, boardRef.current);
    } else {
      resetAnimations(boardRef.current);
    }
  }, [winningCombo]);
  
  const renderSquare = (index: number) => {
    const isWinningSquare = winningCombo ? winningCombo.includes(index) : false;
    
    return (
      <Square 
        key={index}
        value={board[index]}
        onClick={() => onClick(index)}
        isWinningSquare={isWinningSquare}
        index={index}
      />
    );
  };
  
  return (
    <div 
      ref={boardRef}
      className="game-board"
    >
      {board.map((_, index) => renderSquare(index))}
    </div>
  );
};

export default Board;
