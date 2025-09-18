import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipe } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_X_POSITION,
  GRAVITY,
  JUMP_STRENGTH,
  PIPE_WIDTH,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_SPACING_FRAMES,
} from '../constants';

interface GameProps {
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: (score: number) => void;
}

interface GameState {
  playerY: number;
  pipes: Pipe[];
}

const Game: React.FC<GameProps> = ({ setScore, onGameOver }) => {
  const [gameState, setGameState] = useState<GameState>({
    playerY: GAME_HEIGHT / 2,
    pipes: [],
  });

  const playerVelocityRef = useRef(0);
  const frameCountRef = useRef(0);
  const gameLoopId = useRef<number | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const handleJump = useCallback(() => {
    playerVelocityRef.current = JUMP_STRENGTH;
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
      if ('code' in e && e.code !== 'Space') return;
      e.preventDefault();
      handleJump();
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.focus();
      gameArea.addEventListener('keydown', handleKeyPress);
      gameArea.addEventListener('click', handleKeyPress);
      gameArea.addEventListener('touchstart', handleKeyPress, { passive: false });
    }
    return () => {
      if (gameArea) {
        gameArea.removeEventListener('keydown', handleKeyPress);
        gameArea.removeEventListener('click', handleKeyPress);
        gameArea.removeEventListener('touchstart', handleKeyPress);
      }
    };
  }, [handleJump]);

  useEffect(() => {
    let isGameOver = false;

    const loop = () => {
      if (isGameOver) {
        if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
        return;
      }

      setGameState(prev => {
        // 1. Player Physics
        playerVelocityRef.current += GRAVITY;
        let newPlayerY = prev.playerY + playerVelocityRef.current;

        // 2. Pipe Logic
        frameCountRef.current += 1;
        let newPipes = prev.pipes
          .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        // 3. Generate new pipes
        if (frameCountRef.current % PIPE_SPACING_FRAMES === 0) {
          const gapCenter = Math.random() * (GAME_HEIGHT - PIPE_GAP - 300) + 150;
          newPipes.push({ x: GAME_WIDTH, gapY: gapCenter, scored: false });
        }

        // 4. Scoring
        let scoreIncreased = false;
        newPipes.forEach(pipe => {
          if (!pipe.scored && pipe.x + PIPE_WIDTH < PLAYER_X_POSITION) {
            pipe.scored = true;
            scoreRef.current += 1;
            scoreIncreased = true;
          }
        });
        if (scoreIncreased) setScore(scoreRef.current);

        // 5. Collision Detection
        const playerTop = newPlayerY;
        const playerBottom = newPlayerY + PLAYER_HEIGHT;

        // Ground collision
        if (playerBottom > GAME_HEIGHT - 40) {
          isGameOver = true;
          onGameOverRef.current(scoreRef.current);
          return prev;
        }

        // Ceiling collision
        if (playerTop < 0) {
          playerVelocityRef.current = 0;
          newPlayerY = 0;
        }

        // Pipe collision
        for (const pipe of newPipes) {
          const playerLeft = PLAYER_X_POSITION;
          const playerRight = playerLeft + PLAYER_WIDTH;
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;

          const topPipeBottom = pipe.gapY - PIPE_GAP / 2;
          const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;

          if (playerRight > pipeLeft && playerLeft < pipeRight) {
            if (playerTop < topPipeBottom || playerBottom > bottomPipeTop) {
              isGameOver = true;
              onGameOverRef.current(scoreRef.current);
              return prev;
            }
          }
        }
        
        // 6. Return new state
        return {
          playerY: newPlayerY,
          pipes: newPipes,
        };
      });

      gameLoopId.current = requestAnimationFrame(loop);
    };

    gameLoopId.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopId.current) {
        cancelAnimationFrame(gameLoopId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playerRotation = Math.max(-25, Math.min(90, playerVelocityRef.current * 6));

  return (
    <div
      ref={gameAreaRef}
      tabIndex={0}
      className="w-full h-full outline-none"
    >
      
      {/* Pillars */}
      {gameState.pipes.map((pipe, index) => {
        const topPipeHeight = pipe.gapY - PIPE_GAP / 2;
        const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;
        const bottomPipeHeight = GAME_HEIGHT - bottomPipeTop;
        return (
          <React.Fragment key={index}>
            {/* Top Pillar */}
            <div
              className="absolute bg-gray-800 border-4 border-black"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: topPipeHeight,
              }}
            >
               <div className="absolute -bottom-2 h-10 w-full bg-gray-700 border-4 border-black rounded-sm"></div>
            </div>
            {/* Bottom Pillar */}
            <div
              className="absolute bg-gray-800 border-4 border-black"
              style={{
                left: pipe.x,
                top: bottomPipeTop,
                width: PIPE_WIDTH,
                height: bottomPipeHeight,
              }}
            >
                 <div className="absolute -top-2 h-10 w-full bg-gray-700 border-4 border-black rounded-sm"></div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Lava Ground */}
      <div 
        className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-orange-600 to-yellow-500 border-t-4 border-orange-800 z-10"
      ></div>

      {/* Player (Demon) */}
      <div
        className="absolute bg-red-600 border-2 border-red-900 rounded-md transition-transform duration-100"
        style={{
          left: PLAYER_X_POSITION,
          top: gameState.playerY,
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT,
          transform: `rotate(${playerRotation}deg)`,
          zIndex: 10,
        }}
      >
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-300 rounded-full border border-black transform -translate-x-1/2 -translate-y-1/2">
           <div className="w-2 h-2 bg-black rounded-full m-auto mt-0.5"></div>
        </div>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-20">
        {scoreRef.current}
      </div>
    </div>
  );
};

export default Game;
