import { UserService } from "../services/userService.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // Get all users
  getUsers = async (req, res) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json({
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch users",
        error: error.message,
      });
    }
  };

  // Get user by ID
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(parseInt(id));

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user",
        error: error.message,
      });
    }
  };

  getCurrentUser = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "User not authenticated",
        });
      }

      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch current user",
        error: error.message,
      });
    }
  };

  // Get comprehensive profile data for frontend
  getCurrentUserProfile = async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "User not authenticated",
        });
      }

      // Calculate additional stats
      const winRate =
        user.totalGames > 0
          ? ((user.totalWins / user.totalGames) * 100).toFixed(1)
          : 0;
      const lossRate =
        user.totalGames > 0
          ? ((user.totalLosses / user.totalGames) * 100).toFixed(1)
          : 0;

      // Format play time to hours and minutes
      const totalHours = Math.floor(user.totalPlayTime / 3600);
      const totalMinutes = Math.floor((user.totalPlayTime % 3600) / 60);

      // Calculate experience needed for next level
      const currentLevelExp = Math.pow(user.level - 1, 2) * 100;
      const nextLevelExp = Math.pow(user.level, 2) * 100;
      const expToNextLevel = nextLevelExp - user.experience;

      const profileData = {
        // Basic user info
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,

        // Game statistics
        stats: {
          totalGames: user.totalGames || 0,
          totalWins: user.totalWins || 0,
          totalLosses: user.totalLosses || 0,
          winRate: parseFloat(winRate),
          lossRate: parseFloat(lossRate),
          highScore: user.highScore || 0,
          totalLines: user.totalLines || 0,
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          totalPlayTime: user.totalPlayTime || 0,
          playTimeFormatted: `${totalHours}h ${totalMinutes}m`,
          level: user.level || 1,
          experience: user.experience || 0,
          expToNextLevel: expToNextLevel > 0 ? expToNextLevel : 0,
        },

        // Achievements
        achievements: user.achievements || [],
        totalAchievements: (user.achievements || []).length,

        // Recent performance indicators
        performance: {
          isOnStreak: (user.currentStreak || 0) > 0,
          recentForm: this.calculateRecentForm(user),
          skillLevel: this.getSkillLevel(user.level || 1),
        },
      };

      res.json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user profile",
        error: error.message,
      });
    }
  };

  // Helper method to calculate recent form
  calculateRecentForm = (user) => {
    const winRate = user.totalGames > 0 ? user.totalWins / user.totalGames : 0;
    const currentStreak = user.currentStreak || 0;

    if (currentStreak >= 5) return "excellent";
    if (currentStreak >= 3) return "good";
    if (winRate >= 0.7) return "good";
    if (winRate >= 0.5) return "average";
    return "improving";
  };

  // Helper method to get skill level
  getSkillLevel = (level) => {
    if (level >= 50) return "Master";
    if (level >= 25) return "Expert";
    if (level >= 10) return "Advanced";
    if (level >= 5) return "Intermediate";
    return "Beginner";
  };

  // Get leaderboard based on user high scores
  getLeaderboard = async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const users = await this.userService.getLeaderboard(parseInt(limit));

      const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        highScore: user.highScore || 0,
        totalGames: user.totalGames || 0,
        totalWins: user.totalWins || 0,
        level: user.level || 1,
        winRate:
          user.totalGames > 0
            ? ((user.totalWins / user.totalGames) * 100).toFixed(1)
            : 0,
      }));

      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch leaderboard",
        error: error.message,
      });
    }
  };

  // Get user's game statistics
  getUserStats = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(parseInt(id));

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const stats = {
        totalGames: user.totalGames,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        highScore: user.highScore,
        totalLines: user.totalLines,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalPlayTime: user.totalPlayTime,
        level: user.level,
        experience: user.experience,
        winRate:
          user.totalGames > 0
            ? ((user.totalWins / user.totalGames) * 100).toFixed(1)
            : 0,
      };

      res.json({
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user statistics",
        error: error.message,
      });
    }
  };

  updateUserStats = async (req, res) => {
    try {
      const { id } = req.params;
      const statsUpdate = req.body;

      const updatedUser = await this.userService.updateUser(
        parseInt(id),
        statsUpdate
      );

      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        message: "User statistics updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update user statistics",
        error: error.message,
      });
    }
  };

  completeGame = async (req, res) => {
    try {
      const { id } = req.params;
      const { score, lines, duration, result } = req.body;

      const user = await this.userService.getUserById(parseInt(id));
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Calculate new stats
      const newStats = {
        totalGames: user.totalGames + 1,
        totalLines: user.totalLines + lines,
        totalPlayTime: user.totalPlayTime + duration,
      };

      // Update high score if applicable
      if (score > user.highScore) {
        newStats.highScore = score;
      }

      // Update win/loss record and streaks
      if (result === "win") {
        newStats.totalWins = user.totalWins + 1;
        newStats.currentStreak = user.currentStreak + 1;

        if (newStats.currentStreak > user.longestStreak) {
          newStats.longestStreak = newStats.currentStreak;
        }
      } else if (result === "loss") {
        newStats.totalLosses = user.totalLosses + 1;
        newStats.currentStreak = 0;
      }

      // Calculate experience and level
      const experienceGained = this.calculateExperience({
        score,
        lines,
        duration,
        result,
      });
      newStats.experience = user.experience + experienceGained;
      newStats.level = this.calculateLevel(newStats.experience);

      // Update user stats
      const updatedUser = await this.userService.updateUser(
        parseInt(id),
        newStats
      );

      // Check achievements
      await this.checkUserAchievements(parseInt(id), updatedUser);

      res.json({
        message: "Game completed successfully",
        data: {
          user: updatedUser,
          experienceGained,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to complete game",
        error: error.message,
      });
    }
  };

  calculateExperience({ score, lines, duration, result }) {
    let experience = 0;

    experience += Math.floor(score / 100);

    // Experience from lines cleared
    experience += lines * 10;

    // Time bonus 
    const timeBonus = Math.min(duration / 60, 10);
    experience += Math.floor(timeBonus);

    if (result === "win") {
      experience += 50;
    }

    return Math.max(experience, 10);
  }

  calculateLevel(experience) {
    // Level formula: level = floor(sqrt(experience / 100)) + 1
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  async checkUserAchievements(userId, user) {
    try {
      const currentAchievements = user.achievements || [];
      const newAchievements = [];

      // Check each achievement (same logic as in achievement controller)
      if (!currentAchievements.includes("first_game") && user.totalGames >= 1) {
        newAchievements.push("first_game");
      }
      if (!currentAchievements.includes("first_win") && user.totalWins >= 1) {
        newAchievements.push("first_win");
      }
      if (
        !currentAchievements.includes("win_streak_5") &&
        user.longestStreak >= 5
      ) {
        newAchievements.push("win_streak_5");
      }
      if (
        !currentAchievements.includes("win_streak_10") &&
        user.longestStreak >= 10
      ) {
        newAchievements.push("win_streak_10");
      }
      if (
        !currentAchievements.includes("score_1000") &&
        user.highScore >= 1000
      ) {
        newAchievements.push("score_1000");
      }
      if (
        !currentAchievements.includes("score_5000") &&
        user.highScore >= 5000
      ) {
        newAchievements.push("score_5000");
      }
      if (
        !currentAchievements.includes("score_10000") &&
        user.highScore >= 10000
      ) {
        newAchievements.push("score_10000");
      }
      if (
        !currentAchievements.includes("lines_100") &&
        user.totalLines >= 100
      ) {
        newAchievements.push("lines_100");
      }
      if (
        !currentAchievements.includes("lines_500") &&
        user.totalLines >= 500
      ) {
        newAchievements.push("lines_500");
      }
      if (
        !currentAchievements.includes("lines_1000") &&
        user.totalLines >= 1000
      ) {
        newAchievements.push("lines_1000");
      }
      if (
        !currentAchievements.includes("play_time_1h") &&
        user.totalPlayTime >= 3600
      ) {
        newAchievements.push("play_time_1h");
      }
      if (
        !currentAchievements.includes("play_time_10h") &&
        user.totalPlayTime >= 36000
      ) {
        newAchievements.push("play_time_10h");
      }
      if (!currentAchievements.includes("level_10") && user.level >= 10) {
        newAchievements.push("level_10");
      }
      if (!currentAchievements.includes("level_25") && user.level >= 25) {
        newAchievements.push("level_25");
      }
      if (!currentAchievements.includes("level_50") && user.level >= 50) {
        newAchievements.push("level_50");
      }

      // Update user with new achievements
      if (newAchievements.length > 0) {
        const updatedAchievements = [
          ...currentAchievements,
          ...newAchievements,
        ];
        await this.userService.updateUser(userId, {
          achievements: updatedAchievements,
        });
      }

      return newAchievements;
    } catch (error) {
      console.error(`Error checking achievements for user ${userId}:`, error);
      return [];
    }
  }

  // Get user game history
  getUserGameHistory = async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit ?? "20");
      const offset = parseInt(req.query.offset ?? "0");

      const rows = await this.userService.getGameHistory(parseInt(id), {
        limit: isNaN(limit) ? 20 : limit,
        offset: isNaN(offset) ? 0 : offset,
      });

      res.json({ success: true, data: rows });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch history",
          error: error.message,
        });
    }
  };

  // Add user game history
  addUserGameHistory = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        score = 0,
        lines = 0,
        duration = 0,
        result = "loss",
        level = 1,
      } = req.body || {};

      const entry = await this.userService.addGameHistory(parseInt(id), {
        score: Number(score) || 0,
        lines: Number(lines) || 0,
        duration: Number(duration) || 0,
        result: ["win", "loss"].includes(result) ? result : "loss",
        level: Number(level) || 1,
      });

      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to add history",
          error: error.message,
        });
    }
  };
}
