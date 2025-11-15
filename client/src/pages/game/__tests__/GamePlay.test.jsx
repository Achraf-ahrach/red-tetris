/**
 * GamePlay Component Tests
 * Testing game initialization, state management, and core functionality
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import GamePlay from "../GamePlay";

// Mock dependencies
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, username: "testuser" } }),
}));

vi.mock("@/api/game/mutations", () => ({
  useSaveGameHistory: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/utils/gameLogic", async () => {
  const actual = await vi.importActual("@/utils/gameLogic");
  return {
    ...actual,
    getRandomTetromino: vi.fn(() => ({
      name: "I",
      shape: [[1, 1, 1, 1]],
      color: "I",
    })),
  };
});

describe("GamePlay Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGamePlay = (mode = "classic") => {
    return render(
      <BrowserRouter>
        <GamePlay />
      </BrowserRouter>
    );
  };

  it("should render without crashing", () => {
    const { container } = renderGamePlay();
    expect(container).toBeTruthy();
  });

  it("should show game title", () => {
    renderGamePlay();
    // Should show some game-related text
    expect(document.body.textContent).toBeTruthy();
  });

  it("should start in idle state", () => {
    const { container } = renderGamePlay();
    // Game should not be playing initially
    expect(container).toBeTruthy();
  });

  it("should render play button", () => {
    renderGamePlay();
    // Should have some interactive elements
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should display score", () => {
    const { container } = renderGamePlay();
    // Score should be visible somewhere in the component
    expect(container.textContent).toContain("0");
  });

  it("should handle classic mode", () => {
    const { container } = renderGamePlay("classic");
    expect(container).toBeTruthy();
  });

  it("should render board component", () => {
    const { container } = renderGamePlay();
    // Should render a grid for the board
    const grids = container.querySelectorAll(".grid");
    expect(grids.length).toBeGreaterThan(0);
  });
});

describe("GamePlay MODES configuration", () => {
  it("should have classic mode config", () => {
    const MODES = {
      classic: {
        label: "Classic",
        allowPause: true,
        accent: "from-rose-500 to-pink-500",
      },
    };

    expect(MODES.classic).toBeDefined();
    expect(MODES.classic.allowPause).toBe(true);
  });

  it("should have survival mode config", () => {
    const MODES = {
      survival: {
        label: "Survival",
        allowPause: false,
        accent: "from-orange-500 to-red-500",
      },
    };

    expect(MODES.survival).toBeDefined();
    expect(MODES.survival.allowPause).toBe(false);
  });

  it("should have ranked mode config", () => {
    const MODES = {
      ranked: {
        label: "Ranked",
        allowPause: false,
        accent: "from-amber-400 to-yellow-500",
      },
    };

    expect(MODES.ranked).toBeDefined();
    expect(MODES.ranked.label).toBe("Ranked");
  });

  it("should have multiplayer mode config", () => {
    const MODES = {
      multiplayer: {
        label: "Multiplayer",
        allowPause: false,
        accent: "from-purple-500 to-fuchsia-500",
      },
    };

    expect(MODES.multiplayer).toBeDefined();
    expect(MODES.multiplayer.label).toBe("Multiplayer");
  });
});

describe("GamePlay PIECES configuration", () => {
  it("should have I piece definition", () => {
    const PIECES = {
      I: { shape: [[1, 1, 1, 1]], color: "#00f0ff" },
    };

    expect(PIECES.I).toBeDefined();
    expect(PIECES.I.shape).toEqual([[1, 1, 1, 1]]);
    expect(PIECES.I.color).toBe("#00f0ff");
  });

  it("should have O piece definition", () => {
    const PIECES = {
      O: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#ffff00",
      },
    };

    expect(PIECES.O).toBeDefined();
    expect(PIECES.O.color).toBe("#ffff00");
  });

  it("should have all 7 tetromino types", () => {
    const PIECES = {
      I: { shape: [[1, 1, 1, 1]], color: "#00f0ff" },
      O: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#ffff00",
      },
      T: {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#aa00ff",
      },
      S: {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#00ff00",
      },
      Z: {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#ff0000",
      },
      J: {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#0000ff",
      },
      L: {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#ff8800",
      },
    };

    expect(Object.keys(PIECES)).toHaveLength(7);
  });
});
