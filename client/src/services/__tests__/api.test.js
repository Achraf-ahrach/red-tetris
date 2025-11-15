/**
 * API Service Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { userAPI, achievementAPI } from "../api";
import * as apiClient from "@/lib/apiClient";

// Mock the apiClient module
vi.mock("@/lib/apiClient", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe("userAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUserProfile", () => {
    it("should call apiGet with correct endpoint", async () => {
      const mockProfile = { id: 1, username: "testuser" };
      apiClient.apiGet.mockResolvedValue(mockProfile);

      const result = await userAPI.getCurrentUserProfile();

      expect(apiClient.apiGet).toHaveBeenCalledWith("/users/me/profile");
      expect(result).toEqual(mockProfile);
    });
  });

  describe("getCurrentUser", () => {
    it("should call apiGet with correct endpoint", async () => {
      const mockUser = { id: 1, username: "testuser" };
      apiClient.apiGet.mockResolvedValue(mockUser);

      const result = await userAPI.getCurrentUser();

      expect(apiClient.apiGet).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(mockUser);
    });
  });

  describe("completeGame", () => {
    it("should call apiPost with userId and game data", async () => {
      const userId = 123;
      const gameData = { score: 1000, level: 5 };
      const mockResponse = { success: true };
      apiClient.apiPost.mockResolvedValue(mockResponse);

      const result = await userAPI.completeGame(userId, gameData);

      expect(apiClient.apiPost).toHaveBeenCalledWith(
        "/users/123/complete-game",
        gameData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getUserStats", () => {
    it("should call apiGet with correct userId endpoint", async () => {
      const userId = 456;
      const mockStats = { gamesPlayed: 10, wins: 5 };
      apiClient.apiGet.mockResolvedValue(mockStats);

      const result = await userAPI.getUserStats(userId);

      expect(apiClient.apiGet).toHaveBeenCalledWith("/users/456/stats");
      expect(result).toEqual(mockStats);
    });
  });

  describe("getLeaderboard", () => {
    it("should call apiGet with default limit", async () => {
      const mockLeaderboard = [{ rank: 1, username: "player1" }];
      apiClient.apiGet.mockResolvedValue(mockLeaderboard);

      const result = await userAPI.getLeaderboard();

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        "/users/leaderboard?limit=50"
      );
      expect(result).toEqual(mockLeaderboard);
    });

    it("should call apiGet with custom limit", async () => {
      const mockLeaderboard = [{ rank: 1, username: "player1" }];
      apiClient.apiGet.mockResolvedValue(mockLeaderboard);

      const result = await userAPI.getLeaderboard(100);

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        "/users/leaderboard?limit=100"
      );
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe("getUserHistory", () => {
    it("should call apiGet with default params", async () => {
      const userId = 789;
      const mockHistory = [{ gameId: 1, score: 500 }];
      apiClient.apiGet.mockResolvedValue(mockHistory);

      const result = await userAPI.getUserHistory(userId);

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        "/users/789/history?limit=10&offset=0"
      );
      expect(result).toEqual(mockHistory);
    });

    it("should call apiGet with custom limit and offset", async () => {
      const userId = 789;
      const mockHistory = [{ gameId: 1, score: 500 }];
      apiClient.apiGet.mockResolvedValue(mockHistory);

      const result = await userAPI.getUserHistory(userId, {
        limit: 20,
        offset: 10,
      });

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        "/users/789/history?limit=20&offset=10"
      );
      expect(result).toEqual(mockHistory);
    });

    it("should handle partial params", async () => {
      const userId = 789;
      const mockHistory = [{ gameId: 1, score: 500 }];
      apiClient.apiGet.mockResolvedValue(mockHistory);

      const result = await userAPI.getUserHistory(userId, { limit: 5 });

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        "/users/789/history?limit=5&offset=0"
      );
      expect(result).toEqual(mockHistory);
    });
  });
});

describe("achievementAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserAchievements", () => {
    it("should call apiGet with correct userId endpoint", async () => {
      const userId = 111;
      const mockAchievements = [
        { id: 1, name: "First Win" },
        { id: 2, name: "Speed Demon" },
      ];
      apiClient.apiGet.mockResolvedValue(mockAchievements);

      const result = await achievementAPI.getUserAchievements(userId);

      expect(apiClient.apiGet).toHaveBeenCalledWith(
        "/achievements/user/111"
      );
      expect(result).toEqual(mockAchievements);
    });
  });

  describe("checkAchievements", () => {
    it("should call apiPost with correct userId endpoint", async () => {
      const userId = 222;
      const mockResponse = { newAchievements: [{ id: 3, name: "Master" }] };
      apiClient.apiPost.mockResolvedValue(mockResponse);

      const result = await achievementAPI.checkAchievements(userId);

      expect(apiClient.apiPost).toHaveBeenCalledWith(
        "/achievements/user/222/check",
        {}
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
