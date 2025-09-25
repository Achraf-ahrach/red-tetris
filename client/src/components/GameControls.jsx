import React from "react";

const GameControls = ({
  isGameOver,
  isPaused,
  onStart,
  onPause,
  onRestart,
}) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-900 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-white mb-2">Controls</h3>

      <div className="flex flex-col gap-2">
        {isGameOver ? (
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            New Game
          </button>
        ) : (
          <>
            <button
              onClick={onPause}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={onRestart}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Restart
            </button>
          </>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-300">
        <p className="font-semibold mb-2">Keys:</p>
        <div className="space-y-1">
          <p>← → Move</p>
          <p>↑ Rotate</p>
          <p>↓ Soft Drop</p>
          <p>Space Hard Drop</p>
          <p>P Pause</p>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
