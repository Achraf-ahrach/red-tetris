import {
  placePiece,
  findCompletedLines,
  clearLines,
  isValidMove,
  getLowestValidPosition,
  getAllRotations,
  rotatePiece,
} from "./gameLogic";
import { EmptyCell, BOARD_WIDTH, BOARD_HEIGHT } from "../types";

/**
 * Tetris AI Agent using Pierre Dellacherie's algorithm
 * This AI evaluates board states and chooses the best move
 */
export class TetrisAgent {
  constructor(difficulty = "hard") {
    this.difficulty = difficulty;
    this.weights = this.getWeights(difficulty);
  }

  // Get AI weights based on difficulty
  getWeights(difficulty) {
    const weights = {
      easy: {
        landingHeight: -4.500158825082766,
        rowsEliminated: 3.4181268101392694,
        rowTransitions: -3.2178882868487753,
        columnTransitions: -9.348695305445199,
        holes: -7.899265427351652,
        wells: -3.3855972247263626,
        maxHeight: -2.0,
      },
      medium: {
        landingHeight: -4.500158825082766,
        rowsEliminated: 3.4181268101392694,
        rowTransitions: -3.2178882868487753,
        columnTransitions: -9.348695305445199,
        holes: -7.899265427351652,
        wells: -3.3855972247263626,
        maxHeight: -3.5,
      },
      hard: {
        landingHeight: -4.500158825082766,
        rowsEliminated: 3.4181268101392694,
        rowTransitions: -3.2178882868487753,
        columnTransitions: -9.348695305445199,
        holes: -7.899265427351652,
        wells: -3.3855972247263626,
        maxHeight: -5.0,
      },
    };
    return weights[difficulty] || weights.hard;
  }

  // Get the best move for a given piece
  getBestMove(board, currentPiece) {
    let bestMove = null;
    let bestScore = -Infinity;

    const rotations = getAllRotations(currentPiece.shape);

    // Try each rotation
    for (let rotation = 0; rotation < rotations.length; rotation++) {
      const rotatedPiece = rotations[rotation];

      // Try each horizontal position
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (isValidMove(board, rotatedPiece, { x, y: 0 })) {
          const y = getLowestValidPosition(board, rotatedPiece, x);

          if (isValidMove(board, rotatedPiece, { x, y })) {
            const testBoard = placePiece(
              board,
              rotatedPiece,
              { x, y },
              currentPiece.color
            );
            const score = this.evaluateBoard(
              testBoard,
              y,
              currentPiece.shape.length
            );

            if (score > bestScore) {
              bestScore = score;
              bestMove = { x, y, rotation, score };
            }
          }
        }
      }
    }

    return bestMove;
  }

  // Evaluate board state using Pierre Dellacherie's features
  evaluateBoard(board, landingHeight, pieceHeight) {
    const linesCleared = findCompletedLines(board).length;
    const clearedBoard =
      linesCleared > 0 ? clearLines(board, findCompletedLines(board)) : board;

    const features = {
      landingHeight: landingHeight + (pieceHeight - 1) / 2,
      rowsEliminated: linesCleared,
      rowTransitions: this.getRowTransitions(clearedBoard),
      columnTransitions: this.getColumnTransitions(clearedBoard),
      holes: this.getHoles(clearedBoard),
      wells: this.getWells(clearedBoard),
      maxHeight: this.getMaxHeight(clearedBoard),
    };

    // Calculate weighted score
    let score = 0;
    for (const [feature, value] of Object.entries(features)) {
      score += this.weights[feature] * value;
    }

    return score;
  }

  // Get row transitions (horizontal gaps)
  getRowTransitions(board) {
    let transitions = 0;
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      let prev = false; // Assume walls are filled
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const current = board[row][col] !== EmptyCell.Empty;
        if (current !== prev) {
          transitions++;
        }
        prev = current;
      }
      if (!prev) transitions++; // Right wall transition
    }
    return transitions;
  }

  // Get column transitions (vertical gaps)
  getColumnTransitions(board) {
    let transitions = 0;
    for (let col = 0; col < BOARD_WIDTH; col++) {
      let prev = false; // Assume top is empty
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        const current = board[row][col] !== EmptyCell.Empty;
        if (current !== prev) {
          transitions++;
        }
        prev = current;
      }
    }
    return transitions;
  }

  // Count holes in the board
  getHoles(board) {
    let holes = 0;
    for (let col = 0; col < BOARD_WIDTH; col++) {
      let foundBlock = false;
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        if (board[row][col] !== EmptyCell.Empty) {
          foundBlock = true;
        } else if (foundBlock) {
          holes++;
        }
      }
    }
    return holes;
  }

  // Calculate wells (vertical empty spaces surrounded by blocks)
  getWells(board) {
    let wellSum = 0;

    for (let col = 0; col < BOARD_WIDTH; col++) {
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        if (board[row][col] === EmptyCell.Empty) {
          const leftWall = col === 0 || board[row][col - 1] !== EmptyCell.Empty;
          const rightWall =
            col === BOARD_WIDTH - 1 || board[row][col + 1] !== EmptyCell.Empty;

          if (leftWall && rightWall) {
            // Count depth of well
            let wellDepth = 0;
            for (
              let r = row;
              r < BOARD_HEIGHT && board[r][col] === EmptyCell.Empty;
              r++
            ) {
              wellDepth++;
            }
            wellSum += (wellDepth * (wellDepth + 1)) / 2;
            break;
          }
        }
      }
    }

    return wellSum;
  }

  // Get maximum height of the board
  getMaxHeight(board) {
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (board[row][col] !== EmptyCell.Empty) {
          return BOARD_HEIGHT - row;
        }
      }
    }
    return 0;
  }

  // Generate move sequence to achieve target position
  generateMoveSequence(currentPiece, currentPosition, targetMove) {
    const moves = [];
    let currentRotation = 0;
    let { x: currentX } = currentPosition;

    // Apply rotations
    while (currentRotation < targetMove.rotation) {
      moves.push("rotate");
      currentRotation++;
    }

    // Apply horizontal movements
    while (currentX < targetMove.x) {
      moves.push("right");
      currentX++;
    }
    while (currentX > targetMove.x) {
      moves.push("left");
      currentX--;
    }

    // Drop the piece
    moves.push("drop");

    return moves;
  }

  // Set AI difficulty
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.weights = this.getWeights(difficulty);
  }
}
