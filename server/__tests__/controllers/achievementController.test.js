import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { AchievementController } from "../../src/controllers/achievementController.js";
import { ACHIEVEMENTS } from "../../src/models/user.js";

describe("AchievementController", () => {
  let achievementController;
  let mockUserService;
  let req;
  let res;

  beforeEach(() => {
    mockUserService = {
      getUserById: jest.fn(),
      updateUser: jest.fn(),
    };

    achievementController = new AchievementController();
    // Replace service with mock
    achievementController.userService = mockUserService;

    req = {
      params: {},
      body: {},
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserAchievements", () => {
    test("should return user achievements successfully", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        username: "testuser",
        achievements: [ACHIEVEMENTS.FIRST_GAME, ACHIEVEMENTS.FIRST_WIN],
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await achievementController.getUserAchievements(req, res);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({
        data: mockUser.achievements,
      });
    });

    test("should return empty array when user has no achievements", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        username: "testuser",
        achievements: undefined,
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await achievementController.getUserAchievements(req, res);

      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });

    test("should return 404 when user not found", async () => {
      req.params.userId = "999";
      mockUserService.getUserById.mockResolvedValue(null);

      await achievementController.getUserAchievements(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle errors", async () => {
      req.params.userId = "1";
      const errorMessage = "Database error";
      mockUserService.getUserById.mockRejectedValue(new Error(errorMessage));

      await achievementController.getUserAchievements(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch user achievements",
        error: errorMessage,
      });
    });
  });

  describe("checkAchievements", () => {
    test("should unlock FIRST_GAME achievement", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        totalGames: 1,
        totalWins: 0,
        highScore: 0,
        longestStreak: 0,
        totalLines: 0,
        achievements: [],
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await achievementController.checkAchievements(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Achievements checked successfully",
        data: {
          newAchievements: [ACHIEVEMENTS.FIRST_GAME],
          totalAchievements: 1,
        },
      });
    });

    test("should unlock multiple achievements", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        totalGames: 10,
        totalWins: 5,
        highScore: 1500,
        longestStreak: 5,
        totalLines: 150,
        achievements: [],
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await achievementController.checkAchievements(req, res);

      const response = res.json.mock.calls[0][0];
      const newAchievements = response.data.newAchievements;

      expect(newAchievements).toContain(ACHIEVEMENTS.FIRST_GAME);
      expect(newAchievements).toContain(ACHIEVEMENTS.FIRST_WIN);
      expect(newAchievements).toContain(ACHIEVEMENTS.SCORE_1000);
      expect(newAchievements).toContain(ACHIEVEMENTS.WIN_STREAK_5);
      expect(newAchievements).toContain(ACHIEVEMENTS.LINES_100);
    });

    test("should not unlock already obtained achievements", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        totalGames: 1,
        totalWins: 0,
        highScore: 0,
        longestStreak: 0,
        totalLines: 0,
        achievements: [ACHIEVEMENTS.FIRST_GAME],
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await achievementController.checkAchievements(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Achievements checked successfully",
        data: {
          newAchievements: [],
          totalAchievements: 1,
        },
      });
    });

    test("should unlock high score achievements", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        totalGames: 1,
        totalWins: 0,
        highScore: 10000,
        longestStreak: 0,
        totalLines: 0,
        achievements: [],
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await achievementController.checkAchievements(req, res);

      const response = res.json.mock.calls[0][0];
      const newAchievements = response.data.newAchievements;

      expect(newAchievements).toContain(ACHIEVEMENTS.SCORE_1000);
      expect(newAchievements).toContain(ACHIEVEMENTS.SCORE_5000);
      expect(newAchievements).toContain(ACHIEVEMENTS.SCORE_10000);
    });

    test("should unlock streak achievements", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        totalGames: 10,
        totalWins: 10,
        highScore: 0,
        longestStreak: 10,
        totalLines: 0,
        achievements: [],
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await achievementController.checkAchievements(req, res);

      const response = res.json.mock.calls[0][0];
      const newAchievements = response.data.newAchievements;

      expect(newAchievements).toContain(ACHIEVEMENTS.WIN_STREAK_5);
      expect(newAchievements).toContain(ACHIEVEMENTS.WIN_STREAK_10);
    });

    test("should unlock lines cleared achievements", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        totalGames: 10,
        totalWins: 0,
        highScore: 0,
        longestStreak: 0,
        totalLines: 500,
        achievements: [],
      };

      req.params.userId = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await achievementController.checkAchievements(req, res);

      const response = res.json.mock.calls[0][0];
      const newAchievements = response.data.newAchievements;

      expect(newAchievements).toContain(ACHIEVEMENTS.LINES_100);
      expect(newAchievements).toContain(ACHIEVEMENTS.LINES_500);
    });

    test("should return 404 when user not found", async () => {
      req.params.userId = "999";
      mockUserService.getUserById.mockResolvedValue(null);

      await achievementController.checkAchievements(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle errors", async () => {
      req.params.userId = "1";
      const errorMessage = "Check failed";
      mockUserService.getUserById.mockRejectedValue(new Error(errorMessage));

      await achievementController.checkAchievements(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to check achievements",
        error: errorMessage,
      });
    });
  });
});
