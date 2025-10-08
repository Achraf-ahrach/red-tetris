import { ACHIEVEMENTS } from "../models/user.js";
import { UserService } from "../services/userService.js";

export class AchievementController {
  constructor() {
    this.userService = new UserService();
  }

  // Get user's achievements
  getUserAchievements = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await this.userService.getUserById(parseInt(userId));

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        data: user.achievements || [],
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch user achievements",
        error: error.message,
      });
    }
  };

  checkAchievements = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await this.userService.getUserById(parseInt(userId));

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const currentAchievements = user.achievements || [];
      const newAchievements = [];

      // Check each achievement
      if (
        !currentAchievements.includes(ACHIEVEMENTS.FIRST_GAME) &&
        user.totalGames >= 1
      ) {
        newAchievements.push(ACHIEVEMENTS.FIRST_GAME);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.FIRST_WIN) &&
        user.totalWins >= 1
      ) {
        newAchievements.push(ACHIEVEMENTS.FIRST_WIN);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.WIN_STREAK_5) &&
        user.longestStreak >= 5
      ) {
        newAchievements.push(ACHIEVEMENTS.WIN_STREAK_5);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.WIN_STREAK_10) &&
        user.longestStreak >= 10
      ) {
        newAchievements.push(ACHIEVEMENTS.WIN_STREAK_10);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.SCORE_1000) &&
        user.highScore >= 1000
      ) {
        newAchievements.push(ACHIEVEMENTS.SCORE_1000);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.SCORE_5000) &&
        user.highScore >= 5000
      ) {
        newAchievements.push(ACHIEVEMENTS.SCORE_5000);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.SCORE_10000) &&
        user.highScore >= 10000
      ) {
        newAchievements.push(ACHIEVEMENTS.SCORE_10000);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.LINES_100) &&
        user.totalLines >= 100
      ) {
        newAchievements.push(ACHIEVEMENTS.LINES_100);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.LINES_500) &&
        user.totalLines >= 500
      ) {
        newAchievements.push(ACHIEVEMENTS.LINES_500);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.LINES_1000) &&
        user.totalLines >= 1000
      ) {
        newAchievements.push(ACHIEVEMENTS.LINES_1000);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.PLAY_TIME_1H) &&
        user.totalPlayTime >= 3600
      ) {
        newAchievements.push(ACHIEVEMENTS.PLAY_TIME_1H);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.PLAY_TIME_10H) &&
        user.totalPlayTime >= 36000
      ) {
        newAchievements.push(ACHIEVEMENTS.PLAY_TIME_10H);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.LEVEL_10) &&
        user.level >= 10
      ) {
        newAchievements.push(ACHIEVEMENTS.LEVEL_10);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.LEVEL_25) &&
        user.level >= 25
      ) {
        newAchievements.push(ACHIEVEMENTS.LEVEL_25);
      }
      if (
        !currentAchievements.includes(ACHIEVEMENTS.LEVEL_50) &&
        user.level >= 50
      ) {
        newAchievements.push(ACHIEVEMENTS.LEVEL_50);
      }

      // Update user with new achievements
      if (newAchievements.length > 0) {
        const updatedAchievements = [
          ...currentAchievements,
          ...newAchievements,
        ];
        await this.userService.updateUser(parseInt(userId), {
          achievements: updatedAchievements,
        });
      }

      res.json({
        message: "Achievements checked successfully",
        data: {
          newAchievements,
          totalAchievements:
            currentAchievements.length + newAchievements.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to check achievements",
        error: error.message,
      });
    }
  };
}
