import React from 'react';

interface MenuProps {
  onStart: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-900">
      <h1 className="text-6xl font-bold text-red-600 drop-shadow-[0_4px_2px_rgba(0,0,0,0.4)]">Flappy Demon</h1>
      <button
        onClick={onStart}
        className="mt-8 px-8 py-4 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-2xl transition-all duration-300 transform hover:scale-105 border-2 border-red-900 shadow-lg"
      >
        Start
      </button>
      <p className="mt-6 text-gray-300">Press <span className="font-bold text-white">[SPACE]</span> to Flap</p>
    </div>
  );
};

export default Menu;