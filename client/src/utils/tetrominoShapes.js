/**
 * Shared Tetromino Definitions
 * Used by both multiplayer and single-player modes
 *
 * IMPORTANT: Uses the same format as types.js (Block.I, Block.J, etc.)
 * This ensures compatibility with your existing Board component
 */

import { TETROMINOES, Block } from "@/types";

/**
 * Get tetromino object from piece type string
 * @param {string} type - Piece type ('I', 'O', 'T', 'S', 'Z', 'J', 'L')
 * @returns {Object} Tetromino object with shape, color, and name
 */
export function getPieceFromType(type) {
  if (!type || !TETROMINOES[type]) {
    type = "I";
  }

  return {
    name: type,
    shape: TETROMINOES[type].shape,
    color: TETROMINOES[type].color, // This will be Block.I, Block.J, etc.
  };
}

/**
 * Get a random tetromino (for single-player mode)
 * @returns {Object} Random tetromino object with shape, color, and name
 */
export function getRandomTetromino() {
  const types = Object.keys(TETROMINOES);
  const randomType = types[Math.floor(Math.random() * types.length)];
  return {
    name: randomType,
    shape: TETROMINOES[randomType].shape,
    color: TETROMINOES[randomType].color,
  };
}

/**
 * Re-export TETROMINOES for convenience
 */
export { TETROMINOES, Block };
