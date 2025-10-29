import React from "react";
import Cell from "./Cell";
import { EmptyCell, BOARD_WIDTH, BOARD_HEIGHT } from "../../types";

const Board = ({ currentBoard, currentPiece, currentPosition, isGameOver }) => {
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

  // Compute dynamic sizing: width based on columns, height capped by viewport
  // The wrapper sets max-h and uses CSS grid to make each cell square via aspect-square in Cell
  return (
    <div className="relative">
      <div
        className="grid gap-[2px] sm:gap-[3px] md:gap-1 p-2 sm:p-3 md:p-4 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
          // Limit overall height and width to keep it on screen
          maxHeight: "min(78vh, 88vw)",
          width: "min(88vw, 48rem)",
        }}
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

      {isGameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-4">
              GAME OVER
            </h2>
            <p className="text-xl text-gray-300">Press Restart to play again</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
