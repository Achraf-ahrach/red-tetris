export const Block = {
  I: "I",
  J: "J",
  L: "L",
  O: "O",
  S: "S",
  T: "T",
  Z: "Z",
};

export const EmptyCell = {
  Empty: "Empty",
};

// Indestructible penalty cell marker (full-width garbage)
export const SOLID_PENALTY = "Penalty";

// Tetris piece definitions
export const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: Block.I,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: Block.O,
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: Block.T,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: Block.S,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: Block.Z,
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: Block.J,
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: Block.L,
  },
};

export const TETROMINO_NAMES = Object.keys(TETROMINOES);

// Game constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};
