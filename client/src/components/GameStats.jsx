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
    <div className="flex flex-col gap-4">
      {/* Game Statistics */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-white/20">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-300 mb-1">Score</h3>
            <p className="text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-bold">
              {score.toLocaleString()}
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-300 mb-1">Level</h3>
            <p className="text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 font-bold">
              {level}
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-300 mb-1">Lines</h3>
            <p className="text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold">
              {lines}
            </p>
          </div>
        </div>
      </div>

      {/* Next Piece Preview */}
      {nextPiece && (
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20">
          <p className="text-lg font-semibold text-gray-300 mb-2 text-center">
            Next Piece
          </p>
          <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex items-center justify-center min-h-24">
            <div className="relative flex items-center justify-center">
              {/* Calculate piece bounds for better centering */}
              {(() => {
                const shape = nextPiece.shape;
                const rows = shape.length;
                const cols = shape[0]?.length || 0;

                // Find the actual bounds of the piece
                let minRow = rows,
                  maxRow = -1,
                  minCol = cols,
                  maxCol = -1;
                for (let r = 0; r < rows; r++) {
                  for (let c = 0; c < cols; c++) {
                    if (shape[r][c]) {
                      minRow = Math.min(minRow, r);
                      maxRow = Math.max(maxRow, r);
                      minCol = Math.min(minCol, c);
                      maxCol = Math.max(maxCol, c);
                    }
                  }
                }

                const pieceWidth = maxCol - minCol + 1;
                const pieceHeight = maxRow - minRow + 1;

                return (
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${pieceWidth}, 1fr)`,
                      transform: "scale(1.3)",
                    }}
                  >
                    {Array(pieceHeight)
                      .fill(null)
                      .map((_, row) =>
                        Array(pieceWidth)
                          .fill(null)
                          .map((_, col) => {
                            const actualRow = minRow + row;
                            const actualCol = minCol + col;
                            const isActive =
                              shape[actualRow] && shape[actualRow][actualCol];
                            return (
                              <div
                                key={`${row}-${col}`}
                                className={`w-5 h-5 rounded-sm transition-all duration-200 ${
                                  isActive
                                    ? `${getColorClass(
                                        nextPiece.color
                                      )} shadow-lg border border-white/20 hover:shadow-xl`
                                    : "bg-transparent"
                                }`}
                              />
                            );
                          })
                      )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;
