import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black/50">
      <div className="w-3/4 bg-gray-800/90 p-6 rounded-lg shadow-xl border-4 border-gray-900 text-center">
        <h2 className="text-5xl font-bold text-red-500 drop-shadow">Game Over</h2>
        <div className="mt-6 text-xl space-y-2 text-gray-300">
          <p>Score: <span className="font-bold text-white text-2xl">{score}</span></p>
          <p>Best: <span className="font-bold text-white text-2xl">{highScore}</span></p>
        </div>
        <button
          onClick={onRestart}
          className="mt-8 px-8 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xl transition-all duration-300 transform hover:scale-105 border-2 border-red-900 shadow-lg"
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default GameOver;