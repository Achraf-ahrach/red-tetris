import { AchievementRepository } from "../repositories/achievementRepository.js";
import { UserAchievementRepository } from "../repositories/userAchievementRepository.js";

export class AchievementService {
  constructor() {
    this.achievementRepository = new AchievementRepository();
    this.userAchievementRepository = new UserAchievementRepository();
  }

  // Get all available achievements
  async getAllAchievements() {
    return await this.achievementRepository.findAll();
  }

  // Get user's achievements with unlock status
  async getUserAchievements(userId) {
    return await this.userAchievementRepository.findUserAchievements(userId);
  }

  // Check and unlock achievements based on user stats
  async checkAndUnlockAchievements(userId, gameData) {
    const achievements = await this.achievementRepository.findAll();
    const unlockedAchievements = [];

    for (const achievement of achievements) {
      const hasAchievement =
        await this.userAchievementRepository.hasAchievement(
          userId,
          achievement.id
        );

      if (
        !hasAchievement &&
        this.checkAchievementCriteria(achievement.criteria, gameData)
      ) {
        const unlocked = await this.userAchievementRepository.unlockAchievement(
          userId,
          achievement.id
        );
        if (unlocked) {
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
  }

  // Check if achievement criteria is met
  checkAchievementCriteria(criteria, userData) {
    // Example criteria structure:
    // { type: "score", value: 100000 }
    // { type: "games", value: 100 }
    // { type: "streak", value: 10 }
    // { type: "lines", value: 1000 }

    // Handle null/undefined inputs
    if (!criteria || !userData) {
      return false;
    }

    switch (criteria.type) {
      case "score":
        return userData.highScore >= criteria.value;
      case "games":
        return userData.totalGames >= criteria.value;
      case "wins":
        return userData.totalWins >= criteria.value;
      case "streak":
        return userData.currentStreak >= criteria.value;
      case "lines":
        return userData.totalLines >= criteria.value;
      case "play_time":
        return userData.totalPlayTime >= criteria.value;
      case "win_rate":
        const winRate =
          userData.totalGames > 0
            ? (userData.totalWins / userData.totalGames) * 100
            : 0;
        return winRate >= criteria.value;
      default:
        return false;
    }
  }

  // Create new achievement
  async createAchievement(achievementData) {
    return await this.achievementRepository.create(achievementData);
  }

  // Get achievement statistics for user
  async getUserAchievementStats(userId) {
    return await this.userAchievementRepository.getAchievementStats(userId);
  }
}
