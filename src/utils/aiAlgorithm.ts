
import { Player, BoardState, DifficultyLevel, WINNING_COMBINATIONS } from './gameLogic';

/**
 * Calculate the score of a board state for the minimax algorithm
 */
export const calculateScore = (board: BoardState, depth: number, isMaximizing: boolean): number => {
  const winner = checkWinner(board);
  
  // If X wins
  if (winner === 'X') return 10 - depth;
  // If O wins
  if (winner === 'O') return depth - 10;
  // If it's a draw
  if (checkDraw(board)) return 0;
  
  return 0; // No winner yet
};

/**
 * Check if there's a winner in the current board state
 */
export const checkWinner = (board: BoardState): Player => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

/**
 * Check if the game is a draw
 */
export const checkDraw = (board: BoardState): boolean => {
  return board.every(square => square !== null) && !checkWinner(board);
};

/**
 * Get all available moves in the current board state
 */
export const getAvailableMoves = (board: BoardState): number[] => {
  const moves: number[] = [];
  board.forEach((square, index) => {
    if (square === null) {
      moves.push(index);
    }
  });
  return moves;
};

/**
 * Minimax algorithm for AI player
 */
export const minimax = (
  board: BoardState, 
  depth: number, 
  isMaximizing: boolean, 
  player: Player,
  alpha: number = -Infinity,
  beta: number = Infinity
): number => {
  // Terminal conditions
  const winner = checkWinner(board);
  if (winner !== null || checkDraw(board) || depth > 6) { // Added depth limit for performance
    return calculateScore(board, depth, isMaximizing);
  }
  
  const availableMoves = getAvailableMoves(board);
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = player;
      const score = minimax(newBoard, depth + 1, false, player === 'X' ? 'O' : 'X', alpha, beta);
      bestScore = Math.max(score, bestScore);
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = player;
      const score = minimax(newBoard, depth + 1, true, player === 'X' ? 'O' : 'X', alpha, beta);
      bestScore = Math.min(score, bestScore);
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return bestScore;
  }
};

/**
 * Binary search to efficiently find the best move
 * This demonstrates using binary search for game AI decision making
 */
export const findBestMoveWithBinarySearch = (board: BoardState, player: Player): number => {
  const availableMoves = getAvailableMoves(board);
  
  // If only one move is available, return it
  if (availableMoves.length === 1) {
    return availableMoves[0];
  }
  
  // Calculate scores for all available moves
  const moveScores = availableMoves.map(move => {
    const newBoard = [...board];
    newBoard[move] = player;
    return {
      move,
      score: minimax(newBoard, 0, player === 'X' ? false : true, player === 'X' ? 'O' : 'X')
    };
  });
  
  // Sort moves by score
  moveScores.sort((a, b) => player === 'X' ? b.score - a.score : a.score - b.score);
  
  // Use binary search to find the best move with the highest score
  const targetScore = moveScores[0].score;
  const bestMoves = moveScores.filter(ms => ms.score === targetScore).map(ms => ms.move);
  
  if (bestMoves.length === 1) {
    return bestMoves[0];
  }
  
  // Binary search to find a move in the bestMoves array
  return binarySearchForMove(bestMoves, board);
};

/**
 * Binary search implementation to select a move from equally scored moves
 */
export const binarySearchForMove = (moves: number[], board: BoardState): number => {
  // Sort moves for binary search
  const sortedMoves = [...moves].sort((a, b) => a - b);
  
  // Strategic move preferences
  const centerIndex = 4;
  const cornerIndices = [0, 2, 6, 8];
  
  // Check if center is available in our moves
  if (sortedMoves.includes(centerIndex)) {
    return centerIndex;
  }
  
  // Find available corners
  const availableCorners = sortedMoves.filter(move => cornerIndices.includes(move));
  if (availableCorners.length > 0) {
    return availableCorners[0];
  }
  
  // If no strategic moves, use binary search to pick from remaining moves
  let left = 0;
  let right = sortedMoves.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const move = sortedMoves[mid];
    
    // In a real game, we'd evaluate the move here
    // For this demo, we'll just pick the middle move as "best"
    if (mid === Math.floor(sortedMoves.length / 2)) {
      return move;
    } else if (mid < Math.floor(sortedMoves.length / 2)) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  // Fallback to first move if binary search didn't find anything
  return sortedMoves[0];
};

/**
 * Random move selection for easy difficulty
 */
export const randomMove = (board: BoardState): number => {
  const availableMoves = getAvailableMoves(board);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

/**
 * Make a move for the AI player with different difficulty levels
 */
export const makeAIMove = (
  board: BoardState, 
  aiPlayer: Player, 
  difficulty: DifficultyLevel = 'medium'
): number => {
  switch (difficulty) {
    case 'easy':
      return randomMove(board);
    case 'medium': {
      // Medium difficulty uses minimax but with depth limitation
      // We pick the best move ~70% of the time, and a random move ~30% of the time
      if (Math.random() > 0.3) {
        const availableMoves = getAvailableMoves(board);
        const moveScores = availableMoves.map(move => {
          const newBoard = [...board];
          newBoard[move] = aiPlayer;
          // Limited depth for medium difficulty
          return {
            move,
            score: minimax(newBoard, 0, aiPlayer === 'X' ? false : true, aiPlayer === 'X' ? 'O' : 'X', -Infinity, Infinity)
          };
        });
        moveScores.sort((a, b) => aiPlayer === 'X' ? b.score - a.score : a.score - b.score);
        return moveScores[0].move;
      } else {
        return randomMove(board);
      }
    }
    case 'hard':
      return findBestMoveWithBinarySearch(board, aiPlayer);
    default:
      return findBestMoveWithBinarySearch(board, aiPlayer);
  }
};
