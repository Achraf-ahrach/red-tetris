/**
 * Game Mutations Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useCreateGameSession,
  useJoinGameSession,
  useSubmitScore,
  useUpdateGameSession,
  useLeaveGameSession,
  useSaveGameHistory,
} from "../mutations";
import * as apiClient from "@/lib/apiClient";

// Mock apiClient
vi.mock("@/lib/apiClient", () => ({
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

describe("Game Mutations", () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  describe("useCreateGameSession", () => {
    it("should create game session successfully", async () => {
      const mockSession = { id: "session-123", name: "Test Game" };
      apiClient.apiPost.mockResolvedValue({ session: mockSession });

      const { result } = renderHook(() => useCreateGameSession(), { wrapper });

      result.current.mutate({ mode: "classic" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSession);
      expect(apiClient.apiPost).toHaveBeenCalledWith("/game/sessions", {
        mode: "classic",
      });
    });

    it("should handle error when creating session", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Failed to create" },
      });

      const { result } = renderHook(() => useCreateGameSession(), { wrapper });

      result.current.mutate({ mode: "ranked" });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Failed to create");
    });
  });

  describe("useJoinGameSession", () => {
    it("should join game session successfully", async () => {
      const mockSession = { id: "session-456", players: 2 };
      apiClient.apiPost.mockResolvedValue({ session: mockSession });

      const { result } = renderHook(() => useJoinGameSession(), { wrapper });

      result.current.mutate("session-456");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSession);
      expect(apiClient.apiPost).toHaveBeenCalledWith(
        "/game/sessions/session-456/join"
      );
    });

    it("should handle error when joining session", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Session full" },
      });

      const { result } = renderHook(() => useJoinGameSession(), { wrapper });

      result.current.mutate("session-full");

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Session full");
    });
  });

  describe("useSubmitScore", () => {
    it("should submit score successfully", async () => {
      const mockScore = { userId: 1, score: 5000, rank: 10 };
      apiClient.apiPost.mockResolvedValue({ score: mockScore });

      const { result } = renderHook(() => useSubmitScore(), { wrapper });

      result.current.mutate({ score: 5000, mode: "classic" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockScore);
      expect(apiClient.apiPost).toHaveBeenCalledWith("/game/scores", {
        score: 5000,
        mode: "classic",
      });
    });

    it("should handle error when submitting score", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Invalid score" },
      });

      const { result } = renderHook(() => useSubmitScore(), { wrapper });

      result.current.mutate({ score: -100 });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Invalid score");
    });
  });

  describe("useUpdateGameSession", () => {
    it("should update game session successfully", async () => {
      const mockSession = { id: "session-789", status: "active" };
      apiClient.apiPut.mockResolvedValue({ session: mockSession });

      const { result } = renderHook(() => useUpdateGameSession(), { wrapper });

      result.current.mutate({
        sessionId: "session-789",
        updates: { status: "active" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockSession);
      expect(apiClient.apiPut).toHaveBeenCalledWith(
        "/game/sessions/session-789",
        { status: "active" }
      );
    });

    it("should handle error when updating session", async () => {
      apiClient.apiPut.mockResolvedValue({
        error: true,
        data: { message: "Update failed" },
      });

      const { result } = renderHook(() => useUpdateGameSession(), { wrapper });

      result.current.mutate({
        sessionId: "session-999",
        updates: {},
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Update failed");
    });
  });

  describe("useLeaveGameSession", () => {
    it("should leave game session successfully", async () => {
      apiClient.apiPost.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useLeaveGameSession(), { wrapper });

      result.current.mutate("session-abc");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.apiPost).toHaveBeenCalledWith(
        "/game/sessions/session-abc/leave"
      );
    });

    it("should handle error when leaving session", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Cannot leave" },
      });

      const { result } = renderHook(() => useLeaveGameSession(), { wrapper });

      result.current.mutate("session-xyz");

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Cannot leave");
    });
  });

  describe("useSaveGameHistory", () => {
    it("should save game history successfully", async () => {
      const mockData = { historyId: "hist-123" };
      apiClient.apiPost.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useSaveGameHistory(), { wrapper });

      result.current.mutate({
        userId: 1,
        gameData: { score: 1000, lines: 10 },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(apiClient.apiPost).toHaveBeenCalledWith("/users/1/history", {
        score: 1000,
        lines: 10,
      });
    });

    it("should handle error when saving history", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Save failed" },
      });

      const { result } = renderHook(() => useSaveGameHistory(), { wrapper });

      result.current.mutate({
        userId: 1,
        gameData: {},
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Save failed");
    });
  });
});
