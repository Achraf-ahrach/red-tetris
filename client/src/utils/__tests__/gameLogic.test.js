/**
 * Tetris Game Logic Tests
 *
 * Let's start testing the basic game functions step by step!
 * We'll test the core Tetris mechanics to ensure the game works correctly.
 */

import { describe, it, expect } from "vitest";
import {
  createEmptyBoard,
  cloneBoard,
  isValidMove,
  rotatePiece,
  placePiece,
  findCompletedLines,
  clearLines,
  addGarbageLines,
  calculateScore,
  isGameOver,
  getDropSpeed,
  getRandomTetromino,
  getLowestValidPosition,
  getAllRotations,
} from "../gameLogic";
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  EmptyCell,
  POINTS,
  SOLID_PENALTY,
  TETROMINO_NAMES,
} from "../../types";

/**
 * STEP 1: Test Board Creation
 *
 * The board is the foundation of Tetris. Let's make sure we can create
 * an empty board with the correct dimensions.
 */
describe("Board Creation", () => {
  it("should create an empty board with correct dimensions", () => {
    // Arrange & Act
    const board = createEmptyBoard();

    // Assert
    expect(board).toBeDefined();
    expect(board.length).toBe(BOARD_HEIGHT); // Should have correct height
    expect(board[0].length).toBe(BOARD_WIDTH); // Should have correct width
  });

  it("should fill the board with empty cells", () => {
    // Arrange & Act
    const board = createEmptyBoard();

    // Assert - Check if all cells are empty
    const allEmpty = board.every((row) =>
      row.every((cell) => cell === EmptyCell.Empty)
    );
    expect(allEmpty).toBe(true);
  });
});

/**
 * STEP 2: Test Board Cloning
 *  
 * We need to clone the board frequently to avoid mutating the original.
 * This tests if cloning creates a true copy.
 */
describe("Board Cloning", () => {
  it("should create a new board instance", () => {
    // Arrange
    const originalBoard = createEmptyBoard();

    // Act
    const clonedBoard = cloneBoard(originalBoard);

    // Assert - Should be different objects
    expect(clonedBoard).not.toBe(originalBoard);
    expect(clonedBoard).toEqual(originalBoard); // But same content
  });

  it("should not affect original board when clone is modified", () => {
    // Arrange
    const originalBoard = createEmptyBoard();
    const clonedBoard = cloneBoard(originalBoard);

    // Act - Modify the clone
    clonedBoard[0][0] = "I";

    // Assert - Original should remain unchanged
    expect(originalBoard[0][0]).toBe(EmptyCell.Empty);
    expect(clonedBoard[0][0]).toBe("I");
  });

  it("should handle non-array input gracefully", () => {
    // Act
    const clonedBoard = cloneBoard(null);

    // Assert - Should create empty board
    expect(clonedBoard.length).toBe(BOARD_HEIGHT);
    expect(clonedBoard[0].length).toBe(BOARD_WIDTH);
  });

  it("should handle corrupted row data", () => {
    // Arrange
    const corruptedBoard = [null, undefined, [1, 2, 3]];

    // Act
    const clonedBoard = cloneBoard(corruptedBoard);

    // Assert - Should handle gracefully
    expect(clonedBoard.length).toBe(3);
    expect(clonedBoard[0].length).toBe(BOARD_WIDTH);
    expect(clonedBoard[1].length).toBe(BOARD_WIDTH);
    expect(clonedBoard[2]).toEqual([1, 2, 3]);
  });
});

/**
 * STEP 3: Test Piece Rotation
 *
 * Tetris pieces need to rotate. Let's test the rotation logic with a simple piece.
 */
describe("Piece Rotation", () => {
  it("should rotate a simple I-piece correctly", () => {
    // Arrange - Horizontal I-piece
    const horizontalI = [[1, 1, 1, 1]];

    // Act
    const verticalI = rotatePiece(horizontalI);

    // Assert - Should become vertical
    expect(verticalI).toEqual([[1], [1], [1], [1]]);
  });

  it("should rotate a T-piece correctly", () => {
    // Arrange - T-piece pointing up
    const tPiece = [
      [0, 1, 0],
      [1, 1, 1],
    ];

    // Act
    const rotated = rotatePiece(tPiece);

    // Assert - Should point right
    expect(rotated).toEqual([
      [1, 0],
      [1, 1],
      [1, 0],
    ]);
  });
});

/**
 * STEP 4: Test Position Validation (isValidMove)
 *
 * This is critical - it checks if a piece can be placed at a position
 */
describe("Position Validation", () => {
  const testPiece = [
    [1, 1],
    [1, 1],
  ]; // Simple 2x2 square

  it("should allow valid position in center of board", () => {
    // Arrange
    const board = createEmptyBoard();
    const position = { x: 4, y: 5 };

    // Act & Assert
    expect(isValidMove(board, testPiece, position)).toBe(true);
  });

  it("should reject position outside left boundary", () => {
    // Arrange
    const board = createEmptyBoard();
    const position = { x: -1, y: 5 };

    // Act & Assert
    expect(isValidMove(board, testPiece, position)).toBe(false);
  });

  it("should reject position outside right boundary", () => {
    // Arrange
    const board = createEmptyBoard();
    const position = { x: BOARD_WIDTH - 1, y: 5 }; // Too far right for 2-wide piece

    // Act & Assert
    expect(isValidMove(board, testPiece, position)).toBe(false);
  });

  it("should reject position outside bottom boundary", () => {
    // Arrange
    const board = createEmptyBoard();
    const position = { x: 4, y: BOARD_HEIGHT - 1 }; // Too far down for 2-tall piece

    // Act & Assert
    expect(isValidMove(board, testPiece, position)).toBe(false);
  });

  it("should reject position with collision", () => {
    // Arrange
    const board = createEmptyBoard();
    board[5][4] = "I"; // Place blocking piece
    const position = { x: 4, y: 4 };

    // Act & Assert
    expect(isValidMove(board, testPiece, position)).toBe(false);
  });

  it("should allow position above board (piece spawning)", () => {
    // Arrange
    const board = createEmptyBoard();
    const position = { x: 4, y: -1 }; // Piece partially above board

    // Act & Assert
    expect(isValidMove(board, testPiece, position)).toBe(true);
  });
});

/**
 * STEP 5: Test Piece Placement
 *
 * Tests placing pieces on the board
 */
describe("Piece Placement", () => {
  it("should place piece at given position", () => {
    // Arrange
    const board = createEmptyBoard();
    const piece = [
      [1, 1],
      [1, 1],
    ];
    const position = { x: 4, y: 5 };
    const color = "I";

    // Act
    const newBoard = placePiece(board, piece, position, color);

    // Assert
    expect(newBoard[5][4]).toBe("I");
    expect(newBoard[5][5]).toBe("I");
    expect(newBoard[6][4]).toBe("I");
    expect(newBoard[6][5]).toBe("I");
  });

  it("should not modify original board", () => {
    // Arrange
    const board = createEmptyBoard();
    const piece = [[1, 1]];
    const position = { x: 0, y: 0 };

    // Act
    placePiece(board, piece, position, "I");

    // Assert - Original board unchanged
    expect(board[0][0]).toBe(EmptyCell.Empty);
  });

  it("should handle piece placed partially above board", () => {
    // Arrange
    const board = createEmptyBoard();
    const piece = [
      [1, 1],
      [1, 1],
    ];
    const position = { x: 0, y: -1 }; // Top row above board

    // Act
    const newBoard = placePiece(board, piece, position, "T");

    // Assert - Only bottom row should be placed
    expect(newBoard[0][0]).toBe("T");
    expect(newBoard[0][1]).toBe("T");
  });
});

/**
 * STEP 6: Test Line Clearing
 *
 * Tests finding and clearing completed lines
 */
describe("Line Clearing", () => {
  it("should find completed lines", () => {
    // Arrange
    const board = createEmptyBoard();
    // Fill bottom row completely
    for (let col = 0; col < BOARD_WIDTH; col++) {
      board[BOARD_HEIGHT - 1][col] = "I";
    }

    // Act
    const completedLines = findCompletedLines(board);

    // Assert
    expect(completedLines).toEqual([BOARD_HEIGHT - 1]);
  });

  it("should find multiple completed lines", () => {
    // Arrange
    const board = createEmptyBoard();
    // Fill last 3 rows
    for (let row = BOARD_HEIGHT - 3; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        board[row][col] = "I";
      }
    }

    // Act
    const completedLines = findCompletedLines(board);

    // Assert
    expect(completedLines.length).toBe(3);
  });

  it("should not include incomplete lines", () => {
    // Arrange
    const board = createEmptyBoard();
    // Fill bottom row but leave one cell empty
    for (let col = 0; col < BOARD_WIDTH - 1; col++) {
      board[BOARD_HEIGHT - 1][col] = "I";
    }

    // Act
    const completedLines = findCompletedLines(board);

    // Assert
    expect(completedLines).toEqual([]);
  });

  it("should not clear lines with penalty blocks", () => {
    // Arrange
    const board = createEmptyBoard();
    // Fill bottom row with one penalty block
    for (let col = 0; col < BOARD_WIDTH; col++) {
      board[BOARD_HEIGHT - 1][col] = col === 5 ? SOLID_PENALTY : "I";
    }

    // Act
    const completedLines = findCompletedLines(board);

    // Assert - Should not be cleared due to penalty block
    expect(completedLines).toEqual([]);
  });

  it("should clear completed lines", () => {
    // Arrange
    const board = createEmptyBoard();
    // Fill bottom row
    for (let col = 0; col < BOARD_WIDTH; col++) {
      board[BOARD_HEIGHT - 1][col] = "I";
    }
    const linesToClear = [BOARD_HEIGHT - 1];

    // Act
    const newBoard = clearLines(board, linesToClear);

    // Assert
    expect(newBoard[BOARD_HEIGHT - 1].every((c) => c === EmptyCell.Empty)).toBe(
      true
    );
    expect(newBoard.length).toBe(BOARD_HEIGHT);
  });

  it("should add empty lines at top after clearing", () => {
    // Arrange
    const board = createEmptyBoard();
    board[BOARD_HEIGHT - 1].fill("I");
    board[BOARD_HEIGHT - 2].fill("T");
    const linesToClear = [BOARD_HEIGHT - 1];

    // Act
    const newBoard = clearLines(board, linesToClear);

    // Assert - Top row should be empty
    expect(newBoard[0].every((c) => c === EmptyCell.Empty)).toBe(true);
    // Second to last row should now have T pieces
    expect(newBoard[BOARD_HEIGHT - 1].every((c) => c === "T")).toBe(true);
  });
});

/**
 * STEP 7: Test Garbage Lines
 *
 * Tests adding penalty/garbage lines (multiplayer feature)
 */
describe("Garbage Lines", () => {
  it("should add garbage lines to bottom", () => {
    // Arrange
    const board = createEmptyBoard();
    const numLines = 2;

    // Act
    const newBoard = addGarbageLines(board, numLines);

    // Assert
    expect(newBoard[BOARD_HEIGHT - 1].every((c) => c === SOLID_PENALTY)).toBe(
      true
    );
    expect(newBoard[BOARD_HEIGHT - 2].every((c) => c === SOLID_PENALTY)).toBe(
      true
    );
  });

  it("should push existing pieces up when adding garbage", () => {
    // Arrange
    const board = createEmptyBoard();
    board[BOARD_HEIGHT - 1][0] = "I"; // Piece at bottom
    const numLines = 1;

    // Act
    const newBoard = addGarbageLines(board, numLines);

    // Assert - Piece moved up one row
    expect(newBoard[BOARD_HEIGHT - 2][0]).toBe("I");
    expect(newBoard[BOARD_HEIGHT - 1][0]).toBe(SOLID_PENALTY);
  });

  it("should handle zero or negative garbage lines", () => {
    // Arrange
    const board = createEmptyBoard();

    // Act
    const newBoard = addGarbageLines(board, 0);

    // Assert - Board unchanged
    expect(newBoard).toEqual(board);
  });
});

/**
 * STEP 8: Test Score Calculation
 *
 * Tests point calculation based on lines cleared
 */
describe("Score Calculation", () => {
  it("should calculate single line score", () => {
    expect(calculateScore(1, 0)).toBe(POINTS.SINGLE * 1);
    expect(calculateScore(1, 5)).toBe(POINTS.SINGLE * 6);
  });

  it("should calculate double line score", () => {
    expect(calculateScore(2, 0)).toBe(POINTS.DOUBLE * 1);
  });

  it("should calculate triple line score", () => {
    expect(calculateScore(3, 0)).toBe(POINTS.TRIPLE * 1);
  });

  it("should calculate tetris (4 lines) score", () => {
    expect(calculateScore(4, 0)).toBe(POINTS.TETRIS * 1);
  });

  it("should multiply score by level", () => {
    const level10Score = calculateScore(4, 10);
    expect(level10Score).toBe(POINTS.TETRIS * 11);
  });

  it("should return 0 for invalid line count", () => {
    expect(calculateScore(0, 5)).toBe(0);
    expect(calculateScore(5, 5)).toBe(0);
  });
});

/**
 * STEP 9: Test Game Over Detection
 *
 * Tests if game over is detected correctly
 */
describe("Game Over Detection", () => {
  it("should detect game over when top row has pieces", () => {
    // Arrange
    const board = createEmptyBoard();
    board[0][5] = "I"; // Piece in top row

    // Act & Assert
    expect(isGameOver(board)).toBe(true);
  });

  it("should detect game over when second row has pieces", () => {
    // Arrange
    const board = createEmptyBoard();
    board[1][5] = "T"; // Piece in second row

    // Act & Assert
    expect(isGameOver(board)).toBe(true);
  });

  it("should not detect game over for empty top rows", () => {
    // Arrange
    const board = createEmptyBoard();
    board[5][5] = "I"; // Piece in middle of board

    // Act & Assert
    expect(isGameOver(board)).toBe(false);
  });
});

/**
 * STEP 10: Test Drop Speed
 *
 * Tests level-based drop speed calculation
 */
describe("Drop Speed", () => {
  it("should decrease speed as level increases", () => {
    const speed0 = getDropSpeed(0);
    const speed5 = getDropSpeed(5);

    expect(speed5).toBeLessThan(speed0);
  });

  it("should have minimum speed cap", () => {
    const veryHighLevelSpeed = getDropSpeed(100);
    expect(veryHighLevelSpeed).toBeGreaterThanOrEqual(50);
  });

  it("should calculate correct speed for level 0", () => {
    expect(getDropSpeed(0)).toBe(1000);
  });
});

/**
 * STEP 11: Test Random Tetromino Generation
 *
 * Tests getting random pieces
 */
describe("Random Tetromino", () => {
  it("should return a valid tetromino", () => {
    // Act
    const piece = getRandomTetromino();

    // Assert
    expect(piece).toHaveProperty("name");
    expect(piece).toHaveProperty("shape");
    expect(piece).toHaveProperty("color");
    expect(TETROMINO_NAMES).toContain(piece.name);
  });

  it("should return different pieces over multiple calls", () => {
    // Act - Generate 20 pieces
    const pieces = Array.from({ length: 20 }, () => getRandomTetromino());
    const uniqueNames = new Set(pieces.map((p) => p.name));

    // Assert - Should have at least 2 different types
    expect(uniqueNames.size).toBeGreaterThan(1);
  });
});

/**
 * STEP 12: Test Lowest Valid Position (Hard Drop)
 *
 * Tests finding where piece would land
 */
describe("Lowest Valid Position", () => {
  it("should find bottom position for empty board", () => {
    // Arrange
    const board = createEmptyBoard();
    const piece = [[1, 1]];
    const x = 5;

    // Act
    const lowestY = getLowestValidPosition(board, piece, x);

    // Assert
    expect(lowestY).toBe(BOARD_HEIGHT - 1);
  });

  it("should find position above obstacle", () => {
    // Arrange
    const board = createEmptyBoard();
    board[BOARD_HEIGHT - 1][5] = "I"; // Obstacle at bottom
    const piece = [[1, 1]];
    const x = 5;

    // Act
    const lowestY = getLowestValidPosition(board, piece, x);

    // Assert
    expect(lowestY).toBe(BOARD_HEIGHT - 2);
  });
});

/**
 * STEP 13: Test All Rotations
 *
 * Tests getting all 4 rotations of a piece
 */
describe("All Rotations", () => {
  it("should return 4 rotations", () => {
    // Arrange
    const piece = [
      [1, 0],
      [1, 1],
      [0, 1],
    ];

    // Act
    const rotations = getAllRotations(piece);

    // Assert
    expect(rotations).toHaveLength(4);
  });

  it("should have original piece as first rotation", () => {
    // Arrange
    const piece = [[1, 1]];

    // Act
    const rotations = getAllRotations(piece);

    // Assert
    expect(rotations[0]).toEqual(piece);
  });
});


