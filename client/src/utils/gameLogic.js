import {
  TETROMINOES,
  TETROMINO_NAMES,
  EmptyCell,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  POINTS,
} from "../types";

// Create empty board
export const createEmptyBoard = () => {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
};

// Get random tetromino
export const getRandomTetromino = () => {
  const randomIndex = Math.floor(Math.random() * TETROMINO_NAMES.length);
  const name = TETROMINO_NAMES[randomIndex];
  return {
    name,
    shape: TETROMINOES[name].shape,
    color: TETROMINOES[name].color,
  };
};

// Rotate piece 90 degrees clockwise
export const rotatePiece = (piece) => {
  const rotated = piece[0].map((_, index) =>
    piece.map((row) => row[index]).reverse()
  );
  return rotated;
};

// Check if position is valid
export const isValidMove = (board, piece, position) => {
  const { x, y } = position;

  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col] !== 0) {
        const newX = x + col;
        const newY = y + row;

        // Check boundaries
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }

        // Check collision with existing pieces
        if (newY >= 0 && board[newY][newX] !== EmptyCell.Empty) {
          return false;
        }
      }
    }
  }
  return true;
};

// Place piece on board
export const placePiece = (board, piece, position, color) => {
  const newBoard = board.map((row) => [...row]);
  const { x, y } = position;

  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col] !== 0) {
        const newY = y + row;
        if (newY >= 0) {
          newBoard[newY][x + col] = color;
        }
      }
    }
  }
  return newBoard;
};

// Find completed lines
export const findCompletedLines = (board) => {
  const completedLines = [];
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    if (board[row].every((cell) => cell !== EmptyCell.Empty)) {
      completedLines.push(row);
    }
  }
  return completedLines;
};

// Clear completed lines
export const clearLines = (board, linesToClear) => {
  const newBoard = board.filter((_, index) => !linesToClear.includes(index));
  const clearedLines = linesToClear.length;

  // Add new empty lines at the top
  for (let i = 0; i < clearedLines; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(EmptyCell.Empty));
  }

  return newBoard;
};

// Calculate score based on lines cleared
export const calculateScore = (linesCleared, level) => {
  const basePoints = {
    1: POINTS.SINGLE,
    2: POINTS.DOUBLE,
    3: POINTS.TRIPLE,
    4: POINTS.TETRIS,
  };

  return (basePoints[linesCleared] || 0) * (level + 1);
};

// Check if game is over
export const isGameOver = (board) => {
  // Check if top rows have any filled cells
  return (
    board[0].some((cell) => cell !== EmptyCell.Empty) ||
    board[1].some((cell) => cell !== EmptyCell.Empty)
  );
};

// Get drop speed based on level
export const getDropSpeed = (level) => {
  return Math.max(50, 1000 - level * 50);
};

// Get the lowest valid position for a piece at x coordinate
export const getLowestValidPosition = (board, piece, x) => {
  let y = 0;
  while (isValidMove(board, piece, { x, y: y + 1 })) {
    y++;
  }
  return y;
};

// Get all possible rotations of a piece
export const getAllRotations = (piece) => {
  const rotations = [piece];
  let currentPiece = piece;

  for (let i = 0; i < 3; i++) {
    currentPiece = rotatePiece(currentPiece);
    rotations.push(currentPiece);
  }

  return rotations;
};
