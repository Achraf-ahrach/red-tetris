import React from "react";
import Cell from "./Cell";
import { EmptyCell, BOARD_WIDTH, BOARD_HEIGHT } from "../types";

const getCellColor = (cellType) => {
  const colors = {
    I: "bg-cyan-400", // Cyan for I piece
    J: "bg-blue-500", // Blue for J piece
    L: "bg-orange-500", // Orange for L piece
    O: "bg-yellow-400", // Yellow for O piece
    S: "bg-green-500", // Green for S piece
    T: "bg-purple-500", // Purple for T piece
    Z: "bg-red-500", // Red for Z piece
  };
  return colors[cellType] || "bg-gray-500";
};

const Board = ({
  currentBoard,
  currentPiece,
  currentPosition,
  isGameOver,
  aiEnabled,
}) => {
  // Create display board with current piece overlaid
  const getDisplayBoard = () => {
    const displayBoard = currentBoard.map((row) => [...row]);

    if (currentPiece && currentPosition) {
      const { x, y } = currentPosition;
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col] !== 0) {
            const newY = y + row;
            const newX = x + col;
            if (
              newY >= 0 &&
              newY < BOARD_HEIGHT &&
              newX >= 0 &&
              newX < BOARD_WIDTH
            ) {
              displayBoard[newY][newX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  const displayBoard = getDisplayBoard();

  return (
    <div className="relative">
      <div
        className={`grid gap-1 p-4 bg-black border-2 rounded-lg shadow-lg ${
          aiEnabled ? "border-green-500" : "border-gray-600"
        }`}
        style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}
      >
        {displayBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              type={cell}
              isEmpty={cell === EmptyCell.Empty}
            />
          ))
        )}
      </div>

      {/* AI Indicator */}
      {aiEnabled && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          🤖 AI
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
            <p className="text-xl text-white">Press Restart to play again</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
