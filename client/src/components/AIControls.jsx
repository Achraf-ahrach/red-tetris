import React from "react";

const AIControls = ({
  aiEnabled,
  aiDifficulty,
  onToggleAI,
  onChangeDifficulty,
  aiSpeed,
  onChangeSpeed,
  aiStats,
}) => {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg min-w-64">
      <h3 className="text-lg font-bold text-white mb-4">🤖 AI Agent</h3>

      {/* AI Toggle */}
      <div className="mb-4">
        <button
          onClick={onToggleAI}
          className={`w-full px-4 py-2 rounded transition-colors ${
            aiEnabled
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-white"
          }`}
        >
          {aiEnabled ? "🤖 AI Playing" : "👤 Human Playing"}
        </button>
      </div>

      {/* AI Difficulty */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          AI Difficulty
        </label>
        <select
          value={aiDifficulty}
          onChange={(e) => onChangeDifficulty(e.target.value)}
          disabled={!aiEnabled}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white disabled:opacity-50"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* AI Speed */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          AI Speed: {aiSpeed}ms
        </label>
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={aiSpeed}
          onChange={(e) => onChangeSpeed(parseInt(e.target.value))}
          disabled={!aiEnabled}
          className="w-full disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {/* AI Statistics */}
      {aiEnabled && aiStats && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-bold text-white mb-2">AI Performance</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Moves Made:</span>
              <span className="text-white">{aiStats.movesMade || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Avg Score:</span>
              <span className="text-green-400">
                {aiStats.averageScore?.toFixed(1) || "0.0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Best Move:</span>
              <span className="text-blue-400">
                {aiStats.bestMoveScore?.toFixed(1) || "0.0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Thinking:</span>
              <span
                className={`${
                  aiStats.isThinking ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                {aiStats.isThinking ? "🧠 ..." : "💤 Idle"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI Description */}
      <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-300">
        <p className="mb-2">
          <strong>AI Features:</strong>
        </p>
        <ul className="space-y-1 text-xs">
          <li>• Pierre Dellacherie Algorithm</li>
          <li>• Evaluates board positions</li>
          <li>• Minimizes holes & gaps</li>
          <li>• Optimizes line clearing</li>
          <li>• Adjustable difficulty</li>
        </ul>
      </div>
    </div>
  );
};

export default AIControls;
