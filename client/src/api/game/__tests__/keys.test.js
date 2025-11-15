/**
 * Game Keys Tests
 */

import { describe, it, expect } from "vitest";
import { gameKeys } from "../keys";

describe("gameKeys", () => {
  it("should have base all key", () => {
    expect(gameKeys.all).toEqual(["game"]);
  });

  it("should generate sessions key", () => {
    expect(gameKeys.sessions()).toEqual(["game", "sessions"]);
  });

  it("should generate session key with sessionId", () => {
    expect(gameKeys.session("session-123")).toEqual([
      "game",
      "sessions",
      "session-123",
    ]);
  });

  it("should generate stats key", () => {
    expect(gameKeys.stats()).toEqual(["game", "stats"]);
  });

  it("should generate userStats key with userId", () => {
    expect(gameKeys.userStats(456)).toEqual(["game", "stats", "user", 456]);
  });

  it("should generate leaderboard key", () => {
    expect(gameKeys.leaderboard()).toEqual(["game", "leaderboard"]);
  });

  it("should generate leaderboardByMode key with mode", () => {
    expect(gameKeys.leaderboardByMode("classic")).toEqual([
      "game",
      "leaderboard",
      "classic",
    ]);
  });

  it("should generate history key", () => {
    expect(gameKeys.history()).toEqual(["game", "history"]);
  });

  it("should generate userHistory key with userId", () => {
    expect(gameKeys.userHistory(789)).toEqual(["game", "history", "user", 789]);
  });

  it("should handle numeric sessionId", () => {
    expect(gameKeys.session(123)).toEqual(["game", "sessions", 123]);
  });

  it("should handle different mode strings", () => {
    expect(gameKeys.leaderboardByMode("multiplayer")).toEqual([
      "game",
      "leaderboard",
      "multiplayer",
    ]);
  });
});
