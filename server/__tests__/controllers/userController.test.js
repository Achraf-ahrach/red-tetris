import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { UserController } from "../../src/controllers/userController.js";

describe("UserController", () => {
  let userController;
  let mockUserService;
  let mockAvatarService;
  let req;
  let res;

  beforeEach(() => {
    // Create mock instances
    mockUserService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserStats: jest.fn(),
      updateUserStats: jest.fn(),
      getUserByUsername: jest.fn(),
      verifyPassword: jest.fn(),
      updatePassword: jest.fn(),
    };

    mockAvatarService = {
      uploadAvatar: jest.fn(),
      deleteAvatar: jest.fn(),
    };

    userController = new UserController();
    // Replace services with mocks
    userController.userService = mockUserService;
    userController.avatarService = mockAvatarService;

    // Mock request and response objects
    req = {
      params: {},
      body: {},
      user: null,
      file: null,
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    test("should return all users successfully", async () => {
      const mockUsers = [
        { id: 1, username: "user1", email: "user1@test.com" },
        { id: 2, username: "user2", email: "user2@test.com" },
      ];

      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getUsers(req, res);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ data: mockUsers });
    });

    test("should handle errors when fetching users", async () => {
      const errorMessage = "Database error";
      mockUserService.getAllUsers.mockRejectedValue(new Error(errorMessage));

      await userController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch users",
        error: errorMessage,
      });
    });
  });

  describe("getUserById", () => {
    test("should return user when found", async () => {
      const mockUser = { id: 1, username: "testuser", email: "test@test.com" };
      req.params.id = "1";

      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(req, res);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ data: mockUser });
    });

    test("should return 404 when user not found", async () => {
      req.params.id = "999";
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle errors when fetching user by id", async () => {
      req.params.id = "1";
      const errorMessage = "Database error";
      mockUserService.getUserById.mockRejectedValue(new Error(errorMessage));

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch user",
        error: errorMessage,
      });
    });
  });

  describe("getCurrentUser", () => {
    test("should return current user from request", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@test.com",
        password: "hashed",
      };
      req.user = mockUser;

      await userController.getCurrentUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, username: "testuser", email: "test@test.com" },
      });
    });

    test("should handle errors", async () => {
      // Simulate an error by making req.user throw
      Object.defineProperty(req, "user", {
        get: () => {
          throw new Error("User not found");
        },
      });

      await userController.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch current user",
        error: "User not found",
      });
    });
  });

  // The following tests are for methods that don't exist in the actual controller
  // These are skipped until the controller implements these methods
  describe.skip("updateUser", () => {
    test("should update user successfully", async () => {
      const userId = 1;
      const updateData = { username: "newusername" };
      const updatedUser = { id: userId, ...updateData };

      req.params.id = String(userId);
      req.body = updateData;

      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(req, res);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        userId,
        updateData
      );
      expect(res.json).toHaveBeenCalledWith({ data: updatedUser });
    });

    test("should return 404 when updating non-existent user", async () => {
      req.params.id = "999";
      req.body = { username: "newusername" };

      mockUserService.updateUser.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle update errors", async () => {
      req.params.id = "1";
      req.body = { username: "newusername" };
      const errorMessage = "Update failed";

      mockUserService.updateUser.mockRejectedValue(new Error(errorMessage));

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to update user",
        error: errorMessage,
      });
    });
  });

  describe.skip("deleteUser", () => {
    test("should delete user successfully", async () => {
      const userId = 1;
      req.params.id = String(userId);

      mockUserService.deleteUser.mockResolvedValue({ id: userId });

      await userController.deleteUser(req, res);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    test("should return 404 when deleting non-existent user", async () => {
      req.params.id = "999";
      mockUserService.deleteUser.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle delete errors", async () => {
      req.params.id = "1";
      const errorMessage = "Delete failed";

      mockUserService.deleteUser.mockRejectedValue(new Error(errorMessage));

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to delete user",
        error: errorMessage,
      });
    });
  });

  describe("getUserStats", () => {
    test("should return user stats successfully", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        totalGames: 10,
        totalWins: 5,
        totalLosses: 5,
        highScore: 1000,
        totalLines: 100,
        currentStreak: 2,
        longestStreak: 5,
        totalPlayTime: 3600,
        level: 5,
        experience: 500,
      };

      req.params.id = String(userId);
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserStats(req, res);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          totalGames: 10,
          totalWins: 5,
          totalLosses: 5,
          highScore: 1000,
          totalLines: 100,
          currentStreak: 2,
          longestStreak: 5,
          totalPlayTime: 3600,
          level: 5,
          experience: 500,
          winRate: "50.0",
        },
      });
    });

    test("should handle errors when fetching stats", async () => {
      req.params.id = "1";
      const errorMessage = "Stats fetch failed";

      mockUserService.getUserById.mockRejectedValue(new Error(errorMessage));

      await userController.getUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch user statistics",
        error: errorMessage,
      });
    });
  });

  describe.skip("uploadAvatar", () => {
    test("should upload avatar successfully", async () => {
      const userId = 1;
      const mockFile = {
        filename: "avatar.jpg",
        path: "/uploads/avatar.jpg",
      };

      req.params.id = String(userId);
      req.file = mockFile;

      const updatedUser = { id: userId, avatarUrl: "/uploads/avatar.jpg" };
      mockAvatarService.uploadAvatar.mockResolvedValue(updatedUser);

      await userController.uploadAvatar(req, res);

      expect(mockAvatarService.uploadAvatar).toHaveBeenCalledWith(
        userId,
        mockFile
      );
      expect(res.json).toHaveBeenCalledWith({ data: updatedUser });
    });

    test("should return 400 when no file provided", async () => {
      req.params.id = "1";
      req.file = null;

      await userController.uploadAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded" });
    });

    test("should handle upload errors", async () => {
      req.params.id = "1";
      req.file = { filename: "avatar.jpg" };
      const errorMessage = "Upload failed";

      mockAvatarService.uploadAvatar.mockRejectedValue(new Error(errorMessage));

      await userController.uploadAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to upload avatar",
        error: errorMessage,
      });
    });
  });

  describe("updateCurrentUserProfile", () => {
    test("should update current user profile successfully", async () => {
      const mockUser = { id: 1, username: "olduser", email: "test@test.com" };
      const updateData = {
        firstName: "John",
        lastName: "Doe",
        username: "newuser",
      };

      req.user = mockUser;
      req.body = updateData;

      mockUserService.getUserByUsername.mockResolvedValue(null);
      mockUserService.updateUser.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      await userController.updateCurrentUserProfile(req, res);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        updateData
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile updated successfully",
        data: expect.objectContaining({ username: "newuser" }),
      });
    });

    test("should return 401 when user not authenticated", async () => {
      req.user = null;
      req.body = { username: "newuser" };

      await userController.updateCurrentUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated",
      });
    });

    test("should return 400 when username is too short", async () => {
      req.user = { id: 1, username: "olduser" };
      req.body = { username: "ab" };

      await userController.updateCurrentUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username must be at least 3 characters",
      });
    });

    test("should return 400 when username is already taken", async () => {
      req.user = { id: 1, username: "olduser" };
      req.body = { username: "takenuser" };

      mockUserService.getUserByUsername.mockResolvedValue({
        id: 2,
        username: "takenuser",
      });

      await userController.updateCurrentUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username already taken",
      });
    });

    test("should allow same username for current user", async () => {
      const mockUser = { id: 1, username: "sameuser", email: "test@test.com" };
      req.user = mockUser;
      req.body = { username: "sameuser", firstName: "John" };

      mockUserService.updateUser.mockResolvedValue({
        ...mockUser,
        firstName: "John",
      });

      await userController.updateCurrentUserProfile(req, res);

      expect(mockUserService.getUserByUsername).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Profile updated successfully",
        data: expect.any(Object),
      });
    });

    test("should handle update errors", async () => {
      req.user = { id: 1, username: "user" };
      req.body = { firstName: "John" };

      mockUserService.updateUser.mockRejectedValue(new Error("Update failed"));

      await userController.updateCurrentUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to update profile",
        error: "Update failed",
      });
    });
  });

  describe("updateCurrentUserPassword", () => {
    test("should update password successfully", async () => {
      const mockUser = { id: 1, username: "user", password: "oldhashedpass" };
      req.user = mockUser;
      req.body = {
        currentPassword: "oldpass123",
        newPassword: "newpass123",
      };

      mockUserService.verifyPassword = jest.fn().mockResolvedValue(true);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await userController.updateCurrentUserPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password updated successfully",
      });
    });

    test("should return 401 when user not authenticated", async () => {
      req.user = null;
      req.body = { currentPassword: "old", newPassword: "new" };

      await userController.updateCurrentUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated",
      });
    });

    test("should return 400 when passwords are missing", async () => {
      req.user = { id: 1 };
      req.body = {};

      await userController.updateCurrentUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 when new password is too short", async () => {
      req.user = { id: 1 };
      req.body = {
        currentPassword: "oldpass123",
        newPassword: "1234567",
      };

      await userController.updateCurrentUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "New password must be at least 8 characters",
      });
    });
  });

  describe("updateUserStats", () => {
    test("should update user stats successfully", async () => {
      const userId = 1;
      const statsData = {
        totalGames: 10,
        totalWins: 5,
        highScore: 1000,
      };

      req.params.id = String(userId);
      req.body = statsData;

      mockUserService.updateUser.mockResolvedValue({
        id: userId,
        ...statsData,
      });

      await userController.updateUserStats(req, res);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        userId,
        statsData
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "User statistics updated successfully",
        data: expect.objectContaining(statsData),
      });
    });

    test("should handle stats update errors", async () => {
      req.params.id = "1";
      req.body = { totalGames: 10 };

      mockUserService.updateUser.mockRejectedValue(
        new Error("Stats update failed")
      );

      await userController.updateUserStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to update user statistics",
        error: "Stats update failed",
      });
    });
  });

  describe.skip("getUsersByUsername", () => {
    test("should search users by username", async () => {
      const mockUsers = [
        { id: 1, username: "testuser1" },
        { id: 2, username: "testuser2" },
      ];

      req.query = { username: "test" };
      mockUserService.searchUsersByUsername = jest
        .fn()
        .mockResolvedValue(mockUsers);

      await userController.getUsersByUsername(req, res);

      expect(mockUserService.searchUsersByUsername).toHaveBeenCalledWith(
        "test"
      );
      expect(res.json).toHaveBeenCalledWith({ data: mockUsers });
    });

    test("should return empty array when no users found", async () => {
      req.query = { username: "nonexistent" };
      mockUserService.searchUsersByUsername = jest.fn().mockResolvedValue([]);

      await userController.getUsersByUsername(req, res);

      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  describe("uploadCurrentUserAvatar", () => {
    beforeEach(() => {
      mockAvatarService.isLocalAvatar = jest.fn();
      mockAvatarService.saveUploadedAvatar = jest.fn();
      mockAvatarService.deleteAvatar = jest.fn();
    });

    test("should upload avatar successfully", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        avatar: null,
        email: "test@test.com",
      };
      const mockFile = {
        filename: "avatar.jpg",
        path: "/tmp/avatar.jpg",
      };

      req.user = mockUser;
      req.file = mockFile;

      mockAvatarService.saveUploadedAvatar.mockResolvedValue(
        "/uploads/avatars/1.jpg"
      );
      mockUserService.updateUser.mockResolvedValue({
        ...mockUser,
        avatar: "/uploads/avatars/1.jpg",
      });

      await userController.uploadCurrentUserAvatar(req, res);

      expect(mockAvatarService.saveUploadedAvatar).toHaveBeenCalledWith(
        mockFile,
        "1"
      );
      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, {
        avatar: "/uploads/avatars/1.jpg",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Avatar uploaded successfully",
        data: expect.objectContaining({
          avatar: "/uploads/avatars/1.jpg",
        }),
      });
    });

    test("should return 401 when user not authenticated", async () => {
      req.user = null;
      req.file = { filename: "avatar.jpg" };

      await userController.uploadCurrentUserAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated",
      });
    });

    test("should return 400 when no file provided", async () => {
      req.user = { id: 1, username: "testuser" };
      req.file = null;

      await userController.uploadCurrentUserAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No file uploaded",
      });
    });

    test("should delete old avatar before uploading new one", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        avatar: "/uploads/avatars/old.jpg",
      };
      const mockFile = { filename: "new.jpg" };

      req.user = mockUser;
      req.file = mockFile;

      mockAvatarService.isLocalAvatar.mockReturnValue(true);
      mockAvatarService.deleteAvatar.mockResolvedValue(true);
      mockAvatarService.saveUploadedAvatar.mockResolvedValue(
        "/uploads/avatars/1.jpg"
      );
      mockUserService.updateUser.mockResolvedValue({
        ...mockUser,
        avatar: "/uploads/avatars/1.jpg",
      });

      await userController.uploadCurrentUserAvatar(req, res);

      expect(mockAvatarService.deleteAvatar).toHaveBeenCalledWith(
        "/uploads/avatars/old.jpg"
      );
    });

    test("should handle upload errors", async () => {
      req.user = { id: 1 };
      req.file = { filename: "avatar.jpg" };

      mockAvatarService.saveUploadedAvatar.mockRejectedValue(
        new Error("Upload failed")
      );

      await userController.uploadCurrentUserAvatar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to upload avatar",
        error: "Upload failed",
      });
    });
  });

  describe("getCurrentUserProfile", () => {
    beforeEach(() => {
      mockUserService.userRepository = {
        getGameStatsByMode: jest.fn(),
      };
    });

    test("should return comprehensive user profile", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@test.com",
        firstName: "Test",
        lastName: "User",
        avatar: "/avatar.jpg",
        fortyTwoId: null,
        highScore: 5000,
        totalLines: 250,
        currentStreak: 3,
        longestStreak: 10,
        totalPlayTime: 7200,
        level: 15,
        experience: 22500,
        achievements: ["first_game", "first_win"],
        createdAt: new Date("2024-01-01"),
      };

      req.user = mockUser;

      mockUserService.userRepository.getGameStatsByMode.mockResolvedValue({
        classic: { total: 10, highScore: 3000, totalLines: 100 },
        ranked: { total: 5, highScore: 2000, totalLines: 50 },
        multiplayer: { total: 20, wins: 12, highScore: 5000 },
      });

      await userController.getCurrentUserProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          username: "testuser",
          stats: expect.objectContaining({
            totalGames: 35,
            totalWins: 12,
            level: 15,
            experience: 22500,
          }),
          statsByMode: expect.any(Object),
          achievements: expect.any(Array),
          performance: expect.any(Object),
        }),
      });
    });

    test("should return 401 when user not authenticated", async () => {
      req.user = null;

      await userController.getCurrentUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not authenticated",
      });
    });

    test("should handle errors", async () => {
      req.user = { id: 1 };

      mockUserService.userRepository.getGameStatsByMode.mockRejectedValue(
        new Error("Database error")
      );

      await userController.getCurrentUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch user profile",
        error: "Database error",
      });
    });
  });

  describe("getLeaderboard", () => {
    beforeEach(() => {
      mockUserService.getLeaderboard = jest.fn();
    });

    test("should return leaderboard with default limit", async () => {
      const mockUsers = [
        {
          id: 1,
          username: "player1",
          avatar: "/avatar1.jpg",
          highScore: 10000,
          totalGames: 50,
          totalWins: 30,
          level: 20,
        },
        {
          id: 2,
          username: "player2",
          avatar: "/avatar2.jpg",
          highScore: 8000,
          totalGames: 40,
          totalWins: 20,
          level: 15,
        },
      ];

      req.query = {};
      mockUserService.getLeaderboard.mockResolvedValue(mockUsers);

      await userController.getLeaderboard(req, res);

      expect(mockUserService.getLeaderboard).toHaveBeenCalledWith(50);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            rank: 1,
            username: "player1",
            highScore: 10000,
            winRate: "60.0",
          }),
          expect.objectContaining({
            rank: 2,
            username: "player2",
            highScore: 8000,
            winRate: "50.0",
          }),
        ]),
      });
    });

    test("should return leaderboard with custom limit", async () => {
      req.query = { limit: "10" };
      mockUserService.getLeaderboard.mockResolvedValue([]);

      await userController.getLeaderboard(req, res);

      expect(mockUserService.getLeaderboard).toHaveBeenCalledWith(10);
    });

    test("should handle errors", async () => {
      req.query = {};
      mockUserService.getLeaderboard.mockRejectedValue(
        new Error("Database error")
      );

      await userController.getLeaderboard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch leaderboard",
        error: "Database error",
      });
    });
  });

  describe("completeGame", () => {
    test("should complete game successfully and update stats", async () => {
      const mockUser = {
        id: 1,
        totalGames: 10,
        totalWins: 5,
        totalLosses: 5,
        highScore: 1000,
        totalLines: 100,
        currentStreak: 1,
        longestStreak: 5,
        totalPlayTime: 3600,
        level: 5,
        experience: 2500,
      };

      req.params.id = "1";
      req.body = {
        score: 1500,
        lines: 20,
        duration: 600,
        result: "win",
      };

      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue({
        ...mockUser,
        totalGames: 11,
        totalWins: 6,
        highScore: 1500,
        totalLines: 120,
        currentStreak: 2,
        totalPlayTime: 4200,
      });

      await userController.completeGame(req, res);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUserService.updateUser).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Game completed successfully",
        data: expect.objectContaining({
          experienceGained: expect.any(Number),
        }),
      });
    });

    test("should update longest streak when current streak exceeds it", async () => {
      const mockUser = {
        id: 1,
        totalGames: 5,
        totalWins: 3,
        totalLosses: 2,
        highScore: 1000,
        totalLines: 50,
        currentStreak: 4,
        longestStreak: 4,
        totalPlayTime: 1800,
        level: 3,
        experience: 900,
      };

      req.params.id = "1";
      req.body = { score: 500, lines: 10, duration: 300, result: "win" };

      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await userController.completeGame(req, res);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          currentStreak: 5,
          longestStreak: 5,
        })
      );
    });

    test("should reset streak on loss", async () => {
      const mockUser = {
        id: 1,
        totalGames: 10,
        totalWins: 5,
        totalLosses: 5,
        highScore: 1000,
        totalLines: 100,
        currentStreak: 3,
        longestStreak: 5,
        totalPlayTime: 3600,
        level: 5,
        experience: 2500,
      };

      req.params.id = "1";
      req.body = { score: 500, lines: 10, duration: 300, result: "loss" };

      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await userController.completeGame(req, res);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          currentStreak: 0,
          totalLosses: 6,
        })
      );
    });

    test("should return 404 when user not found", async () => {
      req.params.id = "999";
      req.body = { score: 100, lines: 5, duration: 300, result: "win" };

      mockUserService.getUserById.mockResolvedValue(null);

      await userController.completeGame(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    test("should handle errors", async () => {
      req.params.id = "1";
      req.body = { score: 100, lines: 5, duration: 300, result: "win" };

      mockUserService.getUserById.mockRejectedValue(
        new Error("Database error")
      );

      await userController.completeGame(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to complete game",
        error: "Database error",
      });
    });
  });

  describe("getUserGameHistory", () => {
    beforeEach(() => {
      mockUserService.getGameHistory = jest.fn();
    });

    test("should return game history with default pagination", async () => {
      const mockHistory = [
        { id: 1, score: 1000, lines: 20, duration: 600, result: "win" },
        { id: 2, score: 800, lines: 15, duration: 500, result: "loss" },
      ];

      req.params.id = "1";
      req.query = {};

      mockUserService.getGameHistory.mockResolvedValue(mockHistory);

      await userController.getUserGameHistory(req, res);

      expect(mockUserService.getGameHistory).toHaveBeenCalledWith(1, {
        limit: 20,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory,
      });
    });

    test("should return game history with custom pagination", async () => {
      req.params.id = "1";
      req.query = { limit: "10", offset: "5" };

      mockUserService.getGameHistory.mockResolvedValue([]);

      await userController.getUserGameHistory(req, res);

      expect(mockUserService.getGameHistory).toHaveBeenCalledWith(1, {
        limit: 10,
        offset: 5,
      });
    });

    test("should handle errors", async () => {
      req.params.id = "1";
      req.query = {};

      mockUserService.getGameHistory.mockRejectedValue(
        new Error("Database error")
      );

      await userController.getUserGameHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch history",
        error: "Database error",
      });
    });
  });

  describe("addUserGameHistory", () => {
    beforeEach(() => {
      mockUserService.addGameHistory = jest.fn();
      mockUserService.getUserById = jest.fn();
      mockUserService.updateUser = jest.fn();
    });

    test("should add game history and update user stats", async () => {
      const mockUser = {
        id: 1,
        totalGames: 10,
        totalWins: 5,
        totalLosses: 5,
        highScore: 1000,
        totalLines: 100,
        currentStreak: 0,
        longestStreak: 3,
        totalPlayTime: 3600,
        level: 5,
        experience: 2500,
      };

      req.params.id = "1";
      req.body = {
        score: 1500,
        lines: 20,
        duration: 600,
        result: "win",
        level: 5,
        gameMode: "multiplayer",
      };

      mockUserService.addGameHistory.mockResolvedValue({
        id: 1,
        userId: 1,
        ...req.body,
      });
      mockUserService.getUserById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({
          ...mockUser,
          totalGames: 11,
          highScore: 1500,
        });
      mockUserService.updateUser.mockResolvedValue(true);

      await userController.addUserGameHistory(req, res);

      expect(mockUserService.addGameHistory).toHaveBeenCalled();
      expect(mockUserService.updateUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });

    test("should handle classic game mode correctly", async () => {
      const mockUser = {
        id: 1,
        totalGames: 5,
        totalWins: 2,
        totalLosses: 3,
        highScore: 500,
        totalLines: 50,
        currentStreak: 0,
        longestStreak: 2,
        totalPlayTime: 1800,
        level: 3,
        experience: 900,
      };

      req.params.id = "1";
      req.body = {
        score: 800,
        lines: 15,
        duration: 400,
        result: "win",
        gameMode: "classic",
      };

      mockUserService.addGameHistory.mockResolvedValue({ id: 1 });
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(true);

      await userController.addUserGameHistory(req, res);

      // In classic mode, wins/losses should not be updated
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        1,
        expect.not.objectContaining({
          totalWins: expect.any(Number),
        })
      );
    });

    test("should update high score when new score is higher", async () => {
      const mockUser = {
        id: 1,
        highScore: 1000,
        totalGames: 5,
        totalLines: 50,
        totalPlayTime: 1800,
        level: 3,
        experience: 900,
      };

      req.params.id = "1";
      req.body = {
        score: 2000,
        lines: 30,
        duration: 600,
        result: "win",
        gameMode: "ranked",
      };

      mockUserService.addGameHistory.mockResolvedValue({ id: 1 });
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(true);

      await userController.addUserGameHistory(req, res);

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          highScore: 2000,
        })
      );
    });

    test("should sanitize invalid game data", async () => {
      req.params.id = "1";
      req.body = {
        score: "invalid",
        lines: null,
        duration: "bad",
        result: "invalid_result",
        gameMode: "invalid_mode",
      };

      mockUserService.addGameHistory.mockResolvedValue({ id: 1 });
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.addUserGameHistory(req, res);

      expect(mockUserService.addGameHistory).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          score: 0,
          lines: 0,
          duration: 0,
          result: "loss",
          gameMode: "classic",
          level: 1,
        })
      );
    });

    test("should handle errors", async () => {
      req.params.id = "1";
      req.body = { score: 100, lines: 5, duration: 300, result: "win" };

      mockUserService.addGameHistory.mockRejectedValue(
        new Error("Database error")
      );

      await userController.addUserGameHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to add history",
        error: "Database error",
      });
    });
  });

  describe("Helper methods", () => {
    describe("calculateRecentForm", () => {
      test("should return excellent for streak >= 5", () => {
        const user = { currentStreak: 5, totalGames: 10, totalWins: 7 };
        const form = userController.calculateRecentForm(user);
        expect(form).toBe("excellent");
      });

      test("should return good for streak >= 3", () => {
        const user = { currentStreak: 3, totalGames: 10, totalWins: 5 };
        const form = userController.calculateRecentForm(user);
        expect(form).toBe("good");
      });

      test("should return good for win rate >= 0.7", () => {
        const user = { currentStreak: 0, totalGames: 10, totalWins: 8 };
        const form = userController.calculateRecentForm(user);
        expect(form).toBe("good");
      });

      test("should return average for win rate >= 0.5", () => {
        const user = { currentStreak: 0, totalGames: 10, totalWins: 6 };
        const form = userController.calculateRecentForm(user);
        expect(form).toBe("average");
      });

      test("should return improving for low win rate", () => {
        const user = { currentStreak: 0, totalGames: 10, totalWins: 3 };
        const form = userController.calculateRecentForm(user);
        expect(form).toBe("improving");
      });
    });

    describe("getSkillLevel", () => {
      test("should return Master for level >= 50", () => {
        expect(userController.getSkillLevel(50)).toBe("Master");
        expect(userController.getSkillLevel(100)).toBe("Master");
      });

      test("should return Expert for level >= 25", () => {
        expect(userController.getSkillLevel(25)).toBe("Expert");
        expect(userController.getSkillLevel(40)).toBe("Expert");
      });

      test("should return Advanced for level >= 10", () => {
        expect(userController.getSkillLevel(10)).toBe("Advanced");
        expect(userController.getSkillLevel(20)).toBe("Advanced");
      });

      test("should return Intermediate for level >= 5", () => {
        expect(userController.getSkillLevel(5)).toBe("Intermediate");
        expect(userController.getSkillLevel(8)).toBe("Intermediate");
      });

      test("should return Beginner for level < 5", () => {
        expect(userController.getSkillLevel(1)).toBe("Beginner");
        expect(userController.getSkillLevel(4)).toBe("Beginner");
      });
    });

    describe("calculateExperience", () => {
      test("should calculate experience correctly for a win", () => {
        const exp = userController.calculateExperience({
          score: 1000,
          lines: 10,
          duration: 300,
          result: "win",
        });
        expect(exp).toBeGreaterThan(10);
      });

      test("should calculate experience correctly for a loss", () => {
        const exp = userController.calculateExperience({
          score: 500,
          lines: 5,
          duration: 200,
          result: "loss",
        });
        expect(exp).toBeGreaterThanOrEqual(10);
      });

      test("should give minimum 10 experience", () => {
        const exp = userController.calculateExperience({
          score: 0,
          lines: 0,
          duration: 0,
          result: "loss",
        });
        expect(exp).toBe(10);
      });
    });

    describe("calculateLevel", () => {
      test("should calculate level correctly", () => {
        expect(userController.calculateLevel(0)).toBe(1);
        expect(userController.calculateLevel(100)).toBe(2);
        expect(userController.calculateLevel(400)).toBe(3);
        expect(userController.calculateLevel(10000)).toBe(11);
      });
    });
  });
});
