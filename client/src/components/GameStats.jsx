import React from "react";

const GameStats = ({ score, level, lines, nextPiece }) => {
  const getColorClass = (blockType) => {
    const colorMap = {
      I: "bg-cyan-400",
      J: "bg-blue-500",
      L: "bg-orange-500",
      O: "bg-yellow-400",
      S: "bg-green-500",
      T: "bg-purple-500",
      Z: "bg-red-500",
    };
    return colorMap[blockType] || "bg-gray-900";
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg min-w-48">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Score</h3>
        <p className="text-2xl font-mono text-yellow-400">
          {score.toLocaleString()}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Level</h3>
        <p className="text-2xl font-mono text-green-400">{level}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Lines</h3>
        <p className="text-2xl font-mono text-blue-400">{lines}</p>
      </div>

      {nextPiece && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Next</h3>
          <div className="bg-gray-800 p-2 rounded">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(4, 1fr)` }}
            >
              {Array(4)
                .fill(null)
                .map((_, row) =>
                  Array(4)
                    .fill(null)
                    .map((_, col) => {
                      const isActive =
                        nextPiece.shape[row] && nextPiece.shape[row][col];
                      return (
                        <div
                          key={`${row}-${col}`}
                          className={`w-4 h-4 border border-gray-600 ${
                            isActive
                              ? getColorClass(nextPiece.color)
                              : "bg-gray-800"
                          }`}
                        />
                      );
                    })
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;
