import React from "react";

const GameControls = ({
  isGameOver,
  isPaused,
  onStart,
  onPause,
  onRestart,
}) => {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <div className="flex gap-3 justify-center">
          {isGameOver ? (
            <button
              onClick={onRestart}
              className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:from-green-600 hover:to-emerald-700"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">🎮</span>
                New Game
              </span>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ) : (
            <>
              <button
                onClick={onPause}
                className="group relative px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg">{isPaused ? "▶️" : "⏸️"}</span>
                  {isPaused ? "Resume" : "Pause"}
                </span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={onRestart}
                className="group relative px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg">🔄</span>
                  Restart
                </span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col p-6 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          Controls
        </h3>
        <div className="text-sm text-gray-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Move:</span>
                <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">
                  ← →
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Rotate:</span>
                <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">
                  ↑
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Soft Drop:</span>
                <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">
                  ↓
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Hard Drop:</span>
                <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">
                  Space
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pause:</span>
                <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">
                  P
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
