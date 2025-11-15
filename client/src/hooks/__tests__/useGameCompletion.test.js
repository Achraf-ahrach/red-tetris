/**
 * useGameCompletion Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGameCompletion } from "../useGameCompletion";
import * as api from "../../services/api";

// Mock the API
vi.mock("../../services/api", () => ({
  userAPI: {
    getCurrentUser: vi.fn(),
    completeGame: vi.fn(),
  },
}));

describe("useGameCompletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete game successfully", async () => {
    const mockUser = { data: { id: 1 } };
    const mockGameData = { score: 1000, lines: 10 };
    const mockResponse = {
      data: { historyId: "hist-123" },
      message: "Game completed!",
    };

    api.userAPI.getCurrentUser.mockResolvedValue(mockUser);
    api.userAPI.completeGame.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGameCompletion());

    let response;
    await waitFor(async () => {
      response = await result.current.completeGame(mockGameData);
    });

    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockResponse.data);
    expect(api.userAPI.getCurrentUser).toHaveBeenCalled();
    expect(api.userAPI.completeGame).toHaveBeenCalledWith(1, mockGameData);
  });

  it("should handle error when user not found", async () => {
    api.userAPI.getCurrentUser.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useGameCompletion());

    let response;
    await waitFor(async () => {
      response = await result.current.completeGame({ score: 100 });
    });

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });

  it("should handle API error", async () => {
    const mockUser = { data: { id: 1 } };
    api.userAPI.getCurrentUser.mockResolvedValue(mockUser);
    api.userAPI.completeGame.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useGameCompletion());

    let response;
    await waitFor(async () => {
      response = await result.current.completeGame({ score: 100 });
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe("API Error");
  });

  it("should set loading state", async () => {
    const mockUser = { data: { id: 1 } };
    api.userAPI.getCurrentUser.mockResolvedValue(mockUser);
    api.userAPI.completeGame.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useGameCompletion());

    expect(result.current.loading).toBe(false);

    const promise = result.current.completeGame({ score: 100 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await promise;
  });
});
