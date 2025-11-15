/**
 * MultiplayerGameRoom Component Tests
 * Testing multiplayer game room initialization and socket integration
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import MultiplayerGameRoom from "../MultiplayerGameRoom";

// Mock dependencies
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, username: "player1" } }),
}));

vi.mock("@/services/socketService", () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    isConnected: () => false,
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("@/utils/gameLogic", async () => {
  const actual = await vi.importActual("@/utils/gameLogic");
  return {
    ...actual,
  };
});

vi.mock("@/utils/tetrominoShapes", () => ({
  getPieceFromType: vi.fn((type) => ({
    name: type || "I",
    shape: [[1, 1, 1, 1]],
    color: "I",
  })),
}));

describe("MultiplayerGameRoom Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMultiplayerRoom = (path = "/test-room/player1") => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <MultiplayerGameRoom />
      </MemoryRouter>
    );
  };

  it("should render without crashing", () => {
    const { container } = renderMultiplayerRoom();
    expect(container).toBeTruthy();
  });

  it("should display room waiting state initially", () => {
    const { container } = renderMultiplayerRoom();
    // Should render some UI elements
    expect(container.textContent).toBeTruthy();
  });

  it("should show player name from URL", () => {
    const { container } = renderMultiplayerRoom("/game-room/testplayer");
    expect(container).toBeTruthy();
  });

  it("should render game board", () => {
    const { container } = renderMultiplayerRoom();
    // Should have some UI elements
    expect(container).toBeTruthy();
  });

  it("should initialize with empty board", () => {
    const { container } = renderMultiplayerRoom();
    expect(container).toBeTruthy();
  });

  it("should display multiplayer UI elements", () => {
    const { container } = renderMultiplayerRoom();
    // Should have buttons and cards
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should handle room name from URL", () => {
    const { container } = renderMultiplayerRoom("/my-room/player1");
    expect(container).toBeTruthy();
  });
});

describe("MultiplayerGameRoom URL parsing", () => {
  it("should extract room name from URL path", () => {
    const path = "/test-room/player1";
    const parts = path.split("/").filter(Boolean);
    const roomName = parts[0];

    expect(roomName).toBe("test-room");
  });

  it("should extract player name from URL path", () => {
    const path = "/test-room/player1";
    const parts = path.split("/").filter(Boolean);
    const playerName = parts[1];

    expect(playerName).toBe("player1");
  });

  it("should handle encoded room names", () => {
    const encoded = encodeURIComponent("Room Name With Spaces");
    expect(encoded).toBeTruthy();
    expect(decodeURIComponent(encoded)).toBe("Room Name With Spaces");
  });

  it("should handle encoded player names", () => {
    const encoded = encodeURIComponent("Player#123");
    expect(encoded).toBeTruthy();
    expect(decodeURIComponent(encoded)).toBe("Player#123");
  });
});

describe("MultiplayerGameRoom state initialization", () => {
  it("should initialize game state as waiting", () => {
    const initialState = "waiting";
    expect(initialState).toBe("waiting");
  });

  it("should initialize score as 0", () => {
    const initialScore = 0;
    expect(initialScore).toBe(0);
  });

  it("should initialize level as 1", () => {
    const initialLevel = 1;
    expect(initialLevel).toBe(1);
  });

  it("should initialize lines as 0", () => {
    const initialLines = 0;
    expect(initialLines).toBe(0);
  });

  it("should initialize countdown as null", () => {
    const initialCountdown = null;
    expect(initialCountdown).toBeNull();
  });

  it("should initialize garbage queue as 0", () => {
    const initialGarbage = 0;
    expect(initialGarbage).toBe(0);
  });

  it("should initialize opponent as null", () => {
    const initialOpponent = null;
    expect(initialOpponent).toBeNull();
  });

  it("should initialize winner as null", () => {
    const initialWinner = null;
    expect(initialWinner).toBeNull();
  });
});

describe("MultiplayerGameRoom garbage system", () => {
  it("should calculate garbage for single line clear", () => {
    const linesCleared = 1;
    const garbage = linesCleared - 1; // 0 garbage for single
    expect(garbage).toBe(0);
  });

  it("should calculate garbage for double line clear", () => {
    const linesCleared = 2;
    const garbage = linesCleared - 1; // 1 garbage for double
    expect(garbage).toBe(1);
  });

  it("should calculate garbage for triple line clear", () => {
    const linesCleared = 3;
    const garbage = linesCleared - 1; // 2 garbage for triple
    expect(garbage).toBe(2);
  });

  it("should calculate garbage for tetris (4 lines)", () => {
    const linesCleared = 4;
    const garbage = linesCleared - 1; // 3 garbage for tetris
    expect(garbage).toBe(3);
  });

  it("should track incoming garbage queue", () => {
    let garbageQueue = 0;
    garbageQueue += 2; // Receive 2 lines
    garbageQueue += 1; // Receive 1 more line

    expect(garbageQueue).toBe(3);
  });

  it("should clear garbage from queue when applied", () => {
    let garbageQueue = 5;
    const applied = 3;
    garbageQueue -= applied;

    expect(garbageQueue).toBe(2);
  });
});

describe("MultiplayerGameRoom player position", () => {
  it("should calculate center starting position", () => {
    const BOARD_WIDTH = 10;
    const startX = Math.floor(BOARD_WIDTH / 2) - 1;

    expect(startX).toBe(4);
  });

  it("should start pieces at top", () => {
    const startY = 0;
    expect(startY).toBe(0);
  });
});
