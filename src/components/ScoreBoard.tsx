
import React from 'react';
import { cn } from '@/lib/utils';
import { type Player, type GameMode } from '@/utils/gameLogic';

interface ScoreBoardProps {
  scores: { X: number; O: number; draws: number };
  currentPlayer: Player;
  gameMode: GameMode;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores, currentPlayer, gameMode }) => {
  return (
    <div className="flex items-center justify-center gap-4 w-full">
      <div className={cn(
        'score-card',
        currentPlayer === 'X' && 'score-card-active'
      )}>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {gameMode === 'player-vs-ai' ? 'You' : 'Player X'}
        </span>
        <span className="text-3xl font-black text-[hsl(var(--game-x))]" style={{
          textShadow: '0 0 15px hsl(var(--glow-x))'
        }}>
          {scores.X}
        </span>
      </div>

      <div className="score-card">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Draw
        </span>
        <span className="text-3xl font-black text-muted-foreground">
          {scores.draws}
        </span>
      </div>

      <div className={cn(
        'score-card',
        currentPlayer === 'O' && 'score-card-active'
      )}>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {gameMode === 'player-vs-ai' ? 'AI' : 'Player O'}
        </span>
        <span className="text-3xl font-black text-[hsl(var(--game-o))]" style={{
          textShadow: '0 0 15px hsl(var(--glow-o))'
        }}>
          {scores.O}
        </span>
      </div>
    </div>
  );
};

export default ScoreBoard;
