/**
 * Board Component Tests
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Board from "../Board";
import { createEmptyBoard } from "@/utils/gameLogic";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/types";

describe("Board Component", () => {
  const emptyBoard = createEmptyBoard();

  it("should render without crashing", () => {
    const { container } = render(
      <Board currentBoard={emptyBoard} currentPiece={null} currentPosition={null} />
    );
    
    expect(container).toBeTruthy();
  });

  it("should render correct number of cells", () => {
    const { container } = render(
      <Board currentBoard={emptyBoard} currentPiece={null} currentPosition={null} />
    );
    
    // Should have BOARD_WIDTH * BOARD_HEIGHT cells
    const cells = container.querySelectorAll('[class*="w-full h-full"]');
    expect(cells.length).toBe(BOARD_WIDTH * BOARD_HEIGHT);
  });

  it("should render empty board correctly", () => {
    const { container } = render(
      <Board currentBoard={emptyBoard} currentPiece={null} currentPosition={null} />
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
  });

  it("should overlay current piece on board", () => {
    const piece = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "I",
    };
    const position = { x: 4, y: 0 };

    const { container } = render(
      <Board
        currentBoard={emptyBoard}
        currentPiece={piece}
        currentPosition={position}
      />
    );
    
    expect(container).toBeTruthy();
  });

  it("should handle board with filled cells", () => {
    const filledBoard = createEmptyBoard();
    filledBoard[BOARD_HEIGHT - 1][0] = "I";
    filledBoard[BOARD_HEIGHT - 1][1] = "O";

    const { container } = render(
      <Board
        currentBoard={filledBoard}
        currentPiece={null}
        currentPosition={null}
      />
    );
    
    expect(container).toBeTruthy();
  });

  it("should apply grid styling", () => {
    const { container } = render(
      <Board currentBoard={emptyBoard} currentPiece={null} currentPosition={null} />
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid.className).toContain('grid');
  });

  it("should handle null current piece", () => {
    const { container } = render(
      <Board
        currentBoard={emptyBoard}
        currentPiece={null}
        currentPosition={{ x: 0, y: 0 }}
      />
    );
    
    expect(container).toBeTruthy();
  });

  it("should handle null current position", () => {
    const piece = {
      shape: [[1, 1]],
      color: "T",
    };

    const { container } = render(
      <Board
        currentBoard={emptyBoard}
        currentPiece={piece}
        currentPosition={null}
      />
    );
    
    expect(container).toBeTruthy();
  });

  it("should not crash with piece partially off-screen", () => {
    const piece = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "S",
    };
    const position = { x: -1, y: 0 }; // Partially off left edge

    const { container } = render(
      <Board
        currentBoard={emptyBoard}
        currentPiece={piece}
        currentPosition={position}
      />
    );
    
    expect(container).toBeTruthy();
  });

  it("should render with game over state", () => {
    const { container } = render(
      <Board
        currentBoard={emptyBoard}
        currentPiece={null}
        currentPosition={null}
        isGameOver={true}
      />
    );
    
    expect(container).toBeTruthy();
  });
});
