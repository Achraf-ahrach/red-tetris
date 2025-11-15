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
  apiPut: vi.fn(),
  default: {
    post: vi.fn(),
  },
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

  describe("updateProfile", () => {
    it("should call apiPut with profile data", async () => {
      const profileData = { username: "newname", bio: "New bio" };
      const mockResponse = { success: true };
      apiClient.apiPut.mockResolvedValue(mockResponse);

      const result = await userAPI.updateProfile(profileData);

      expect(apiClient.apiPut).toHaveBeenCalledWith(
        "/users/me/profile",
        profileData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updatePassword", () => {
    it("should call apiPut with password data", async () => {
      const passwordData = { oldPassword: "old", newPassword: "new" };
      const mockResponse = { success: true };
      apiClient.apiPut.mockResolvedValue(mockResponse);

      const result = await userAPI.updatePassword(passwordData);

      expect(apiClient.apiPut).toHaveBeenCalledWith(
        "/users/me/password",
        passwordData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("uploadAvatar", () => {
    it("should upload avatar file", async () => {
      const mockFile = new File(["avatar"], "avatar.jpg", {
        type: "image/jpeg",
      });
      const mockResponse = { avatarUrl: "/uploads/avatar.jpg" };

      const mockPost = vi.fn().mockResolvedValue({ data: mockResponse });
      vi.mocked(apiClient.default).post = mockPost;

      const result = await userAPI.uploadAvatar(mockFile);

      expect(mockPost).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle upload error", async () => {
      const mockFile = new File(["avatar"], "avatar.jpg", {
        type: "image/jpeg",
      });
      const mockError = {
        response: {
          status: 413,
          data: { message: "File too large" },
        },
      };

      const mockPost = vi.fn().mockRejectedValue(mockError);
      vi.mocked(apiClient.default).post = mockPost;

      const result = await userAPI.uploadAvatar(mockFile);

      expect(result.error).toBe(true);
      expect(result.status).toBe(413);
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

      expect(apiClient.apiGet).toHaveBeenCalledWith("/achievements/user/111");
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
