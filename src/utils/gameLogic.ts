
/**
 * Game logic utilities for Tic Tac Toe with binary search implementation
 */

import { Star, StarHalf, StarOff } from 'lucide-react';
import {
  checkWinner,
  checkDraw,
  getAvailableMoves,
  makeAIMove,
  findBestMoveWithBinarySearch,
  minimax
} from './aiAlgorithm';

export type Player = 'X' | 'O' | null;
export type BoardState = (Player)[];
export type GameMode = 'player-vs-player' | 'player-vs-ai';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Winning combinations (rows, columns, diagonals)
export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// Re-export AI functions
export { 
  checkWinner, 
  checkDraw, 
  getAvailableMoves, 
  makeAIMove,
  findBestMoveWithBinarySearch,
  minimax
};

/**
 * Get difficulty level icon
 */
export const getDifficultyIcon = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'easy':
      return StarOff;
    case 'medium':
      return StarHalf;
    case 'hard':
      return Star;
  }
};

/**
 * Get difficulty level description
 */
export const getDifficultyDescription = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'easy':
      return 'Random moves, great for beginners';
    case 'medium':
      return 'Moderate challenge with basic strategy';
    case 'hard':
      return 'Advanced AI using complex algorithms';
  }
};

/**
 * Create a new empty board
 */
export const createEmptyBoard = (): BoardState => {
  return Array(9).fill(null);
};

/**
 * Get game status text
 */
export const getGameStatusText = (
  winner: Player, 
  isDraw: boolean, 
  currentPlayer: Player
): string => {
  if (winner) {
    return `Player ${winner} wins!`;
  } else if (isDraw) {
    return "It's a draw!";
  } else {
    return `Player ${currentPlayer}'s turn`;
  }
};

/**
 * Binary search to quickly find the index of a specific board state
 * This is useful for game history navigation
 */
export const findBoardStateIndex = (
  gameHistory: BoardState[], 
  targetBoard: BoardState
): number => {
  // Convert board states to strings for comparison
  const targetString = JSON.stringify(targetBoard);
  const historyStrings = gameHistory.map(board => JSON.stringify(board));
  
  // Perform binary search
  let left = 0;
  let right = historyStrings.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (historyStrings[mid] === targetString) {
      return mid;
    }
    
    // Since board states are added chronologically, we can search based on "time"
    if (historyStrings[mid] < targetString) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Not found
};
