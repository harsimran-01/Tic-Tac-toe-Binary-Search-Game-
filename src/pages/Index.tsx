
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RotateCcw, Undo2, Users, Bot, Trophy, Swords, Sun, Moon } from 'lucide-react';
import Board from '@/components/Board';
import ScoreBoard from '@/components/ScoreBoard';
import { useTheme } from '@/components/ThemeProvider';
import { fireWinConfetti } from '@/utils/confetti';
import { 
  type BoardState, 
  type Player, 
  type GameMode,
  type DifficultyLevel,
  WINNING_COMBINATIONS,
  checkWinner, 
  checkDraw, 
  createEmptyBoard, 
  makeAIMove,
  getGameStatusText,
  getDifficultyIcon,
  getDifficultyDescription
} from '@/utils/gameLogic';
import { transitions } from '@/utils/animation';

const Game: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('player-vs-ai');
  const [gameHistory, setGameHistory] = useState<BoardState[]>([createEmptyBoard()]);
  const [currentMove, setCurrentMove] = useState<number>(0);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(true);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('medium');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  
  const boardRef = useRef<HTMLDivElement>(null);
  const gameOver = winner !== null || isDraw;
  
  const handleDifficultyChange = (level: DifficultyLevel) => {
    setDifficultyLevel(level);
    toast.info(`Difficulty set to ${level}`);
  };
  
  const handleSquareClick = (index: number) => {
    if (winner || isDraw || board[index] !== null || (gameMode === 'player-vs-ai' && currentPlayer === 'O' && !gameOver)) {
      return;
    }
    makeMove(index);
  };
  
  const makeMove = (index: number) => {
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const nextWinner = checkWinner(newBoard);
    const nextIsDraw = checkDraw(newBoard);
    
    if (nextWinner) {
      setWinner(nextWinner);
      setWinningCombo(
        WINNING_COMBINATIONS.find(combo => {
          const [a, b, c] = combo;
          return newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c];
        }) || null
      );
      setScores(prev => ({ ...prev, [nextWinner]: prev[nextWinner as 'X' | 'O'] + 1 }));
      fireWinConfetti();
      toast.success(`Player ${nextWinner} wins! 🎉`);
    } else if (nextIsDraw) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      toast.info("It's a draw! 🤝");
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      const newHistory = gameHistory.slice(0, currentMove + 1).concat([newBoard]);
      setGameHistory(newHistory);
      setCurrentMove(newHistory.length - 1);
    }
  };
  
  useEffect(() => {
    if (gameMode === 'player-vs-ai' && currentPlayer === 'O' && !winner && !isDraw) {
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const aiMoveIndex = makeAIMove(board, 'O', difficultyLevel);
        makeMove(aiMoveIndex);
        setIsAIThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, winner, isDraw, difficultyLevel]);
  
  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCombo(null);
    setIsDraw(false);
    setGameHistory([createEmptyBoard()]);
    setCurrentMove(0);
    setIsAIThinking(false);
    toast.info("New round started!");
  };

  const resetAll = () => {
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
    setDifficultyLevel('medium');
    toast.info("All scores reset!");
  };
  
  const handleGameModeChange = (newMode: GameMode) => {
    if (newMode !== gameMode) {
      setGameMode(newMode);
      resetGame();
      setScores({ X: 0, O: 0, draws: 0 });
      toast.info(`Switched to ${newMode === 'player-vs-player' ? 'Player vs Player' : 'Player vs AI'} mode`);
    }
  };
  
  const jumpToMove = (moveIndex: number) => {
    if (moveIndex >= 0 && moveIndex < gameHistory.length) {
      setCurrentMove(moveIndex);
      setBoard(gameHistory[moveIndex]);
      setCurrentPlayer(moveIndex % 2 === 0 ? 'X' : 'O');
      setWinner(null);
      setWinningCombo(null);
      setIsDraw(false);
      
      if (moveIndex === gameHistory.length - 1) {
        const currentWinner = checkWinner(gameHistory[moveIndex]);
        const currentIsDraw = checkDraw(gameHistory[moveIndex]);
        if (currentWinner) {
          setWinner(currentWinner);
          setWinningCombo(
            WINNING_COMBINATIONS.find(combo => {
              const [a, b, c] = combo;
              const boardState = gameHistory[moveIndex];
              return boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c];
            }) || null
          );
        } else if (currentIsDraw) {
          setIsDraw(true);
        }
      }
    }
  };
  
  const handleToggleAnimations = () => {
    setShowAnimation(!showAnimation);
    toast.info(`Animations ${!showAnimation ? 'enabled' : 'disabled'}`);
  };
  
  const statusText = getGameStatusText(winner, isDraw, currentPlayer);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-8 overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[hsl(var(--game-x)/0.08)] blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[hsl(var(--game-o)/0.08)] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary)/0.05)] blur-[150px]" />
      </div>

      <div className={`relative z-10 max-w-6xl w-full ${showAnimation ? 'animate-fade-in' : ''}`}>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="game-title animate-float">Tic Tac Toe</h1>
          <p className="game-subtitle">
            Powered by Binary Search & Minimax AI
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="mt-3 rounded-full"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Score Board */}
        <div className="mb-8">
          <ScoreBoard scores={scores} currentPlayer={currentPlayer} gameMode={gameMode} />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side: Game board */}
          <div className="w-full lg:w-1/2">
            <Card className="glassmorphic-strong overflow-hidden h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Swords className="w-5 h-5 text-primary" />
                      Game Board
                    </CardTitle>
                    <CardDescription className={isAIThinking ? 'animate-pulse-soft' : ''}>
                      {isAIThinking ? "🤖 AI is thinking..." : statusText}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="animations"
                      checked={showAnimation}
                      onCheckedChange={handleToggleAnimations}
                    />
                    <Label htmlFor="animations" className="text-xs text-muted-foreground">FX</Label>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 flex items-center justify-center">
                <div 
                  ref={boardRef}
                  className={`max-w-sm w-full mx-auto aspect-square ${showAnimation && isAIThinking ? 'animate-pulse-soft' : ''}`}
                >
                  <Board 
                    board={board} 
                    onClick={handleSquareClick} 
                    winningCombo={winningCombo}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetGame}
                    disabled={isAIThinking}
                    className="gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    New Round
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => jumpToMove(currentMove - 1)}
                    disabled={currentMove === 0 || isAIThinking}
                    className="gap-1.5"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo
                  </Button>
                </div>
                
                <span className="status-chip">
                  {gameMode === 'player-vs-player' ? 'PvP' : `vs AI • ${difficultyLevel}`}
                </span>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right side: Game controls */}
          <div className="w-full lg:w-1/2">
            <Tabs defaultValue="game-info" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4 glassmorphic border-0">
                <TabsTrigger value="game-info">Settings</TabsTrigger>
                <TabsTrigger value="move-history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="game-info">
                <Card className="glassmorphic-strong h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Game Mode
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={gameMode === 'player-vs-player' ? 'default' : 'outline'}
                        onClick={() => handleGameModeChange('player-vs-player')}
                        disabled={isAIThinking}
                        className="gap-2 h-12"
                      >
                        <Users className="w-4 h-4" />
                        PvP
                      </Button>
                      
                      <Button
                        variant={gameMode === 'player-vs-ai' ? 'default' : 'outline'}
                        onClick={() => handleGameModeChange('player-vs-ai')}
                        disabled={isAIThinking}
                        className="gap-2 h-12"
                      >
                        <Bot className="w-4 h-4" />
                        vs AI
                      </Button>
                    </div>
                    
                    <Separator className="bg-border/30" />
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">AI Difficulty</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => {
                          const DifficultyIcon = getDifficultyIcon(level);
                          return (
                            <Button
                              key={level}
                              variant={difficultyLevel === level ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleDifficultyChange(level)}
                              disabled={gameMode !== 'player-vs-ai' || isAIThinking}
                              className="gap-1.5"
                            >
                              <DifficultyIcon className="w-3.5 h-3.5" />
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Button>
                          );
                        })}
                      </div>
                      
                      {gameMode === 'player-vs-ai' && (
                        <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                          {getDifficultyDescription(difficultyLevel)}
                        </p>
                      )}
                    </div>

                    <Separator className="bg-border/30" />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAll}
                      disabled={isAIThinking}
                      className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All Scores
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="move-history">
                <Card className="glassmorphic-strong h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Move History</CardTitle>
                    <CardDescription>
                      Review and jump to previous moves
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {gameHistory.map((_, index) => (
                        <Button
                          key={index}
                          variant={currentMove === index ? 'default' : 'ghost'}
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => jumpToMove(index)}
                          disabled={isAIThinking}
                        >
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs mr-2 font-mono">
                            {index}
                          </span>
                          {index === 0 ? 'Game Start' : `Move #${index} — ${index % 2 === 0 ? 'O' : 'X'}`}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
