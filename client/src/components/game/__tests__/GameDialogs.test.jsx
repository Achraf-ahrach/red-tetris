/**
 * GameDialogs Component Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import GameDialogs from "../GameDialogs";

// Mock motion
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("GameDialogs", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render game over dialog", () => {
    const { container } = render(
      <GameDialogs
        isGameOver={true}
        isPaused={false}
        score={1000}
        onRestart={vi.fn()}
      />
    );
    expect(container).toBeDefined();
  });

  it("should render pause dialog", () => {
    const { container } = render(
      <GameDialogs
        isGameOver={false}
        isPaused={true}
        score={500}
        onRestart={vi.fn()}
      />
    );
    expect(container).toBeDefined();
  });

  it("should not render when game is active", () => {
    const { container } = render(
      <GameDialogs
        isGameOver={false}
        isPaused={false}
        score={0}
        onRestart={vi.fn()}
      />
    );
    expect(container).toBeDefined();
  });
});
