import React from "react";
import Board from "./components/Board";
import { EmptyCell, Block } from "./types";

// Create a board with some sample pieces for demonstration
const createSampleBoard = () => {
  const board = Array(20)
    .fill(null)
    .map(() => Array(12).fill(EmptyCell.Empty));

  // Add some sample pieces to show colors
  // I piece (cyan)
  for (let i = 0; i < 4; i++) {
    board[17][i + 1] = Block.I;
  }

  // O piece (yellow)
  board[18][5] = Block.O;
  board[18][6] = Block.O;
  board[19][5] = Block.O;
  board[19][6] = Block.O;

  // L piece (orange)
  board[18][8] = Block.L;
  board[19][8] = Block.L;
  board[19][9] = Block.L;
  board[19][10] = Block.L;

  return board;
};

function App() {
  const board = createSampleBoard();

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-red-500">Red Tetris</h1>
      <Board currentBoard={board} />
    </div>
  );
}

export default App;
