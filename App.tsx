import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import Game from './components/Game';
import Menu from './components/Menu';
import GameOver from './components/GameOver';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('flappyDemonHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setGameState(GameState.Playing);
  }, []);

  const endGame = useCallback((currentScore: number) => {
    setGameState(GameState.GameOver);
    if (currentScore > highScore) {
      const newHighScore = currentScore;
      setHighScore(newHighScore);
      localStorage.setItem('flappyDemonHighScore', newHighScore.toString());
    }
  }, [highScore]);
  
  const renderContent = () => {
    switch (gameState) {
      case GameState.Playing:
        return <Game setScore={setScore} onGameOver={endGame} />;
      case GameState.GameOver:
        return <GameOver score={score} highScore={highScore} onRestart={startGame} />;
      case GameState.Menu:
      default:
        return <Menu onStart={startGame} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black font-mono select-none">
       <div 
        className="relative bg-red-900 overflow-hidden border-2 border-black shadow-2xl"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default App;