/**
 * Game Queries Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useGameSession,
  useUserStats,
  useLeaderboard,
  useUserGameHistory,
} from "../queries";
import * as apiClient from "@/lib/apiClient";
import { tokenUtils } from "../../auth/keys";

// Mock apiClient
vi.mock("@/lib/apiClient", () => ({
  apiGet: vi.fn(),
}));

// Mock tokenUtils
vi.mock("../../auth/keys", async () => {
  const actual = await vi.importActual("../../auth/keys");
  return {
    ...actual,
    tokenUtils: {
      hasTokens: vi.fn(() => true),
    },
  };
});

describe("Game Queries", () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  describe("useGameSession", () => {
    it("should fetch game session successfully", async () => {
      const mockSession = {
        id: "session-123",
        name: "Test Game",
        players: [],
      };
      apiClient.apiGet.mockResolvedValue({ session: mockSession });

      const { result } = renderHook(
        () => useGameSession("session-123"),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSession);
      expect(apiClient.apiGet).toHaveBeenCalledWith("/game/sessions/session-123");
    });

    it("should handle session fetch error", async () => {
      apiClient.apiGet.mockResolvedValue({
        error: true,
        data: { message: "Session not found" },
      });

      const { result } = renderHook(
        () => useGameSession("session-invalid"),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Session not found");
    });

    it("should not fetch when sessionId is null", async () => {
      const { result } = renderHook(() => useGameSession(null), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(apiClient.apiGet).not.toHaveBeenCalled();
    });

    it("should not fetch when no tokens", async () => {
      tokenUtils.hasTokens.mockReturnValue(false);

      const { result } = renderHook(
        () => useGameSession("session-123"),
        { wrapper }
      );

      expect(result.current.isFetching).toBe(false);
      expect(apiClient.apiGet).not.toHaveBeenCalled();

      tokenUtils.hasTokens.mockReturnValue(true);
    });
  });

  describe("useUserStats", () => {
    it("should fetch user stats successfully", async () => {
      const mockStats = {
        userId: 1,
        gamesPlayed: 100,
        highScore: 50000,
        totalLines: 500,
      };
      apiClient.apiGet.mockResolvedValue({ stats: mockStats });

      const { result } = renderHook(() => useUserStats(1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStats);
      expect(apiClient.apiGet).toHaveBeenCalledWith("/game/stats/user/1");
    });

    it("should handle stats fetch error", async () => {
      apiClient.apiGet.mockResolvedValue({
        error: true,
        data: { message: "User not found" },
      });

      const { result } = renderHook(() => useUserStats(999), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("User not found");
    });

    it("should not fetch when userId is null", async () => {
      const { result } = renderHook(() => useUserStats(null), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(apiClient.apiGet).not.toHaveBeenCalled();
    });

    it("should not fetch when no tokens", async () => {
      tokenUtils.hasTokens.mockReturnValue(false);

      const { result } = renderHook(() => useUserStats(1), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(apiClient.apiGet).not.toHaveBeenCalled();

      tokenUtils.hasTokens.mockReturnValue(true);
    });
  });

  describe("useLeaderboard", () => {
    it("should fetch leaderboard successfully", async () => {
      const mockLeaderboard = [
        { rank: 1, username: "player1", score: 10000 },
        { rank: 2, username: "player2", score: 9000 },
      ];
      apiClient.apiGet.mockResolvedValue({ leaderboard: mockLeaderboard });

      const { result } = renderHook(() => useLeaderboard("classic"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockLeaderboard);
      expect(apiClient.apiGet).toHaveBeenCalledWith("/game/leaderboard?mode=classic");
    });

    it("should fetch leaderboard for different modes", async () => {
      const mockLeaderboard = [
        { rank: 1, username: "player1", score: 15000 },
      ];
      apiClient.apiGet.mockResolvedValue({ leaderboard: mockLeaderboard });

      const { result } = renderHook(() => useLeaderboard("speedrun"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.apiGet).toHaveBeenCalledWith("/game/leaderboard?mode=speedrun");
    });

    it("should handle leaderboard fetch error", async () => {
      apiClient.apiGet.mockResolvedValue({
        error: true,
        data: { message: "Failed to load leaderboard" },
      });

      const { result } = renderHook(() => useLeaderboard("classic"), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Failed to load leaderboard");
    });
  });

  describe("useUserGameHistory", () => {
    it("should fetch user game history successfully", async () => {
      const mockHistory = [
        { id: 1, score: 5000, date: "2024-01-01" },
        { id: 2, score: 6000, date: "2024-01-02" },
      ];
      apiClient.apiGet.mockResolvedValue({ history: mockHistory });

      const { result } = renderHook(() => useUserGameHistory(1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockHistory);
      expect(apiClient.apiGet).toHaveBeenCalledWith("/game/history/user/1");
    });

    it("should handle history fetch error", async () => {
      apiClient.apiGet.mockResolvedValue({
        error: true,
        data: { message: "History not found" },
      });

      const { result } = renderHook(() => useUserGameHistory(999), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("History not found");
    });

    it("should not fetch when userId is null", async () => {
      const { result } = renderHook(() => useUserGameHistory(null), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(apiClient.apiGet).not.toHaveBeenCalled();
    });

    it("should not fetch when no tokens", async () => {
      tokenUtils.hasTokens.mockReturnValue(false);

      const { result } = renderHook(() => useUserGameHistory(1), { wrapper });

      expect(result.current.isFetching).toBe(false);
      expect(apiClient.apiGet).not.toHaveBeenCalled();

      tokenUtils.hasTokens.mockReturnValue(true);
    });
  });
});
