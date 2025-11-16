import { AchievementService } from "../../src/services/achievementService.js";

// Mock repositories
class MockAchievementRepository {
  constructor() {
    this.achievements = [];
    this.nextId = 1;
  }

  async findAll() {
    return [...this.achievements];
  }

  async create(data) {
    const achievement = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
    };
    this.achievements.push(achievement);
    return achievement;
  }

  clear() {
    this.achievements = [];
    this.nextId = 1;
  }
}

class MockUserAchievementRepository {
  constructor() {
    this.userAchievements = [];
  }

  async findUserAchievements(userId) {
    return this.userAchievements.filter((ua) => ua.userId === userId);
  }

  async hasAchievement(userId, achievementId) {
    return this.userAchievements.some(
      (ua) => ua.userId === userId && ua.achievementId === achievementId
    );
  }

  async unlockAchievement(userId, achievementId) {
    const existing = await this.hasAchievement(userId, achievementId);
    if (existing) return null;

    const userAchievement = {
      userId,
      achievementId,
      unlockedAt: new Date(),
    };
    this.userAchievements.push(userAchievement);
    return userAchievement;
  }

  async getAchievementStats(userId) {
    const userAchievements = await this.findUserAchievements(userId);
    return {
      totalUnlocked: userAchievements.length,
      achievements: userAchievements,
    };
  }

  clear() {
    this.userAchievements = [];
  }
}

describe("AchievementService", () => {
  let achievementService;
  let mockAchievementRepo;
  let mockUserAchievementRepo;

  beforeEach(() => {
    mockAchievementRepo = new MockAchievementRepository();
    mockUserAchievementRepo = new MockUserAchievementRepository();

    achievementService = new AchievementService();
    achievementService.achievementRepository = mockAchievementRepo;
    achievementService.userAchievementRepository = mockUserAchievementRepo;
  });

  afterEach(() => {
    mockAchievementRepo.clear();
    mockUserAchievementRepo.clear();
  });

  describe("getAllAchievements", () => {
    test("should return all achievements", async () => {
      // Add some test achievements
      await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });
      await mockAchievementRepo.create({
        name: "High Score",
        criteria: { type: "score", value: 1000 },
      });

      const achievements = await achievementService.getAllAchievements();

      expect(achievements).toHaveLength(2);
      expect(achievements[0].name).toBe("First Game");
      expect(achievements[1].name).toBe("High Score");
    });

    test("should return empty array when no achievements exist", async () => {
      const achievements = await achievementService.getAllAchievements();
      expect(achievements).toHaveLength(0);
    });
  });

  describe("getUserAchievements", () => {
    test("should return user's unlocked achievements", async () => {
      const userId = 1;

      // Create achievements
      const achievement1 = await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });

      // Unlock achievement for user
      await mockUserAchievementRepo.unlockAchievement(userId, achievement1.id);

      const userAchievements = await achievementService.getUserAchievements(
        userId
      );

      expect(userAchievements).toHaveLength(1);
      expect(userAchievements[0].achievementId).toBe(achievement1.id);
    });

    test("should return empty array for user with no achievements", async () => {
      const userAchievements = await achievementService.getUserAchievements(1);
      expect(userAchievements).toHaveLength(0);
    });
  });

  describe("checkAchievementCriteria", () => {
    test("should check score criteria correctly", () => {
      const criteria = { type: "score", value: 1000 };
      const userData = { highScore: 1500 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(true);
    });

    test("should fail score criteria when score is too low", () => {
      const criteria = { type: "score", value: 1000 };
      const userData = { highScore: 500 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(false);
    });

    test("should check games criteria correctly", () => {
      const criteria = { type: "games", value: 10 };
      const userData = { totalGames: 15 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(true);
    });

    test("should check wins criteria correctly", () => {
      const criteria = { type: "wins", value: 5 };
      const userData = { totalWins: 7 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(true);
    });

    test("should check streak criteria correctly", () => {
      const criteria = { type: "streak", value: 5 };
      const userData = { currentStreak: 6 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(true);
    });

    test("should check lines criteria correctly", () => {
      const criteria = { type: "lines", value: 100 };
      const userData = { totalLines: 150 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(true);
    });

    test("should check play_time criteria correctly", () => {
      const criteria = { type: "play_time", value: 3600 };
      const userData = { totalPlayTime: 7200 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(true);
    });

    test("should check win_rate criteria correctly", () => {
      const criteria = { type: "win_rate", value: 50 };
      const userData = { totalGames: 10, totalWins: 6 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(true);
    });

    test("should calculate win_rate as 0 when no games played", () => {
      const criteria = { type: "win_rate", value: 50 };
      const userData = { totalGames: 0, totalWins: 0 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(false);
    });

    test("should return false for unknown criteria type", () => {
      const criteria = { type: "unknown", value: 100 };
      const userData = { someValue: 150 };

      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );

      expect(result).toBe(false);
    });
  });

  describe("checkAndUnlockAchievements", () => {
    test("should unlock achievements when criteria is met", async () => {
      const userId = 1;

      // Create achievements
      await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });
      await mockAchievementRepo.create({
        name: "High Score",
        criteria: { type: "score", value: 1000 },
      });

      const gameData = {
        totalGames: 5,
        highScore: 1500,
      };

      const unlockedAchievements =
        await achievementService.checkAndUnlockAchievements(userId, gameData);

      expect(unlockedAchievements).toHaveLength(2);
      expect(unlockedAchievements[0].name).toBe("First Game");
      expect(unlockedAchievements[1].name).toBe("High Score");
    });

    test("should not unlock already obtained achievements", async () => {
      const userId = 1;

      // Create achievement
      const achievement = await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });

      // Unlock it first
      await mockUserAchievementRepo.unlockAchievement(userId, achievement.id);

      const gameData = { totalGames: 5 };

      const unlockedAchievements =
        await achievementService.checkAndUnlockAchievements(userId, gameData);

      expect(unlockedAchievements).toHaveLength(0);
    });

    test("should not unlock achievements when criteria is not met", async () => {
      const userId = 1;

      await mockAchievementRepo.create({
        name: "High Score",
        criteria: { type: "score", value: 1000 },
      });

      const gameData = { highScore: 500 };

      const unlockedAchievements =
        await achievementService.checkAndUnlockAchievements(userId, gameData);

      expect(unlockedAchievements).toHaveLength(0);
    });

    test("should unlock only achievements that meet criteria", async () => {
      const userId = 1;

      await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });
      await mockAchievementRepo.create({
        name: "100 Games",
        criteria: { type: "games", value: 100 },
      });

      const gameData = { totalGames: 5 };

      const unlockedAchievements =
        await achievementService.checkAndUnlockAchievements(userId, gameData);

      expect(unlockedAchievements).toHaveLength(1);
      expect(unlockedAchievements[0].name).toBe("First Game");
    });
  });

  describe("createAchievement", () => {
    test("should create new achievement", async () => {
      const achievementData = {
        name: "Master",
        description: "Complete 1000 games",
        criteria: { type: "games", value: 1000 },
      };

      const achievement = await achievementService.createAchievement(
        achievementData
      );

      expect(achievement.name).toBe(achievementData.name);
      expect(achievement.description).toBe(achievementData.description);
      expect(achievement.criteria).toEqual(achievementData.criteria);
      expect(achievement.id).toBeDefined();
    });
  });

  describe("getUserAchievementStats", () => {
    test("should return achievement statistics for user", async () => {
      const userId = 1;

      // Create and unlock some achievements
      const achievement1 = await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });
      const achievement2 = await mockAchievementRepo.create({
        name: "First Win",
        criteria: { type: "wins", value: 1 },
      });

      await mockUserAchievementRepo.unlockAchievement(userId, achievement1.id);
      await mockUserAchievementRepo.unlockAchievement(userId, achievement2.id);

      const stats = await achievementService.getUserAchievementStats(userId);

      expect(stats.totalUnlocked).toBe(2);
      expect(stats.achievements).toHaveLength(2);
    });

    test("should return zero stats for user with no achievements", async () => {
      const stats = await achievementService.getUserAchievementStats(1);

      expect(stats.totalUnlocked).toBe(0);
      expect(stats.achievements).toHaveLength(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle null or undefined criteria gracefully", () => {
      const result = achievementService.checkAchievementCriteria(null, {});
      expect(result).toBe(false);
    });

    test("should handle undefined userData", () => {
      const criteria = { type: "score", value: 1000 };
      const result = achievementService.checkAchievementCriteria(
        criteria,
        undefined
      );
      expect(result).toBe(false);
    });

    test("should handle empty criteria object", () => {
      const criteria = {};
      const userData = { highScore: 1500 };
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(false);
    });

    test("should handle missing userData properties", () => {
      const criteria = { type: "score", value: 1000 };
      const userData = {}; // Missing highScore
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(false);
    });

    test("should handle negative values in criteria", () => {
      const criteria = { type: "score", value: -100 };
      const userData = { highScore: 50 };
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true); // 50 >= -100
    });

    test("should handle zero values correctly", () => {
      const criteria = { type: "games", value: 0 };
      const userData = { totalGames: 0 };
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle exact threshold values", () => {
      const criteria = { type: "score", value: 1000 };
      const userData = { highScore: 1000 }; // Exactly at threshold
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle very large numbers", () => {
      const criteria = { type: "score", value: 999999999 };
      const userData = { highScore: 1000000000 };
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle floating point numbers in win rate", () => {
      const criteria = { type: "win_rate", value: 33.33 };
      const userData = { totalGames: 3, totalWins: 1 }; // 33.33% win rate
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should unlock multiple achievements for single user", async () => {
      const userId = 1;

      // Create multiple achievements
      await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });
      await mockAchievementRepo.create({
        name: "10 Games",
        criteria: { type: "games", value: 10 },
      });
      await mockAchievementRepo.create({
        name: "First Win",
        criteria: { type: "wins", value: 1 },
      });
      await mockAchievementRepo.create({
        name: "High Score",
        criteria: { type: "score", value: 1000 },
      });

      const gameData = {
        totalGames: 15,
        totalWins: 5,
        highScore: 5000,
      };

      const unlockedAchievements =
        await achievementService.checkAndUnlockAchievements(userId, gameData);

      expect(unlockedAchievements).toHaveLength(4);
    });

    test("should handle partial achievement unlocking", async () => {
      const userId = 1;

      const achievement1 = await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });
      await mockAchievementRepo.create({
        name: "100 Games",
        criteria: { type: "games", value: 100 },
      });

      // Unlock first achievement
      await mockUserAchievementRepo.unlockAchievement(userId, achievement1.id);

      const gameData = { totalGames: 50 };

      const unlockedAchievements =
        await achievementService.checkAndUnlockAchievements(userId, gameData);

      // Should not unlock already obtained or unmet achievements
      expect(unlockedAchievements).toHaveLength(0);
    });

    test("should handle empty game data", async () => {
      const userId = 1;

      await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });

      const gameData = {};

      const unlockedAchievements =
        await achievementService.checkAndUnlockAchievements(userId, gameData);

      expect(unlockedAchievements).toHaveLength(0);
    });

    test("should handle multiple users independently", async () => {
      const userId1 = 1;
      const userId2 = 2;

      const achievement = await mockAchievementRepo.create({
        name: "First Game",
        criteria: { type: "games", value: 1 },
      });

      // Unlock for user 1
      await mockUserAchievementRepo.unlockAchievement(userId1, achievement.id);

      // User 2 should still be able to unlock
      const user1Achievements = await achievementService.getUserAchievements(
        userId1
      );
      const user2Achievements = await achievementService.getUserAchievements(
        userId2
      );

      expect(user1Achievements).toHaveLength(1);
      expect(user2Achievements).toHaveLength(0);
    });
  });

  describe("Achievement Criteria Edge Cases", () => {
    test("should handle win_rate with fractional wins", () => {
      const criteria = { type: "win_rate", value: 75 };
      const userData = { totalGames: 4, totalWins: 3 }; // 75% exactly
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle win_rate just below threshold", () => {
      const criteria = { type: "win_rate", value: 50 };
      const userData = { totalGames: 10, totalWins: 4 }; // 40%
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(false);
    });

    test("should handle perfect win rate", () => {
      const criteria = { type: "win_rate", value: 100 };
      const userData = { totalGames: 10, totalWins: 10 }; // 100%
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle zero win rate", () => {
      const criteria = { type: "win_rate", value: 0 };
      const userData = { totalGames: 10, totalWins: 0 }; // 0%
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle play_time in seconds", () => {
      const criteria = { type: "play_time", value: 7200 }; // 2 hours
      const userData = { totalPlayTime: 7200 };
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle very long play times", () => {
      const criteria = { type: "play_time", value: 86400 }; // 24 hours
      const userData = { totalPlayTime: 100000 }; // More than 24 hours
      const result = achievementService.checkAchievementCriteria(
        criteria,
        userData
      );
      expect(result).toBe(true);
    });

    test("should handle currentStreak vs longestStreak", () => {
      const criteria = { type: "streak", value: 5 };

      // Test with currentStreak
      const userData1 = { currentStreak: 5 };
      expect(
        achievementService.checkAchievementCriteria(criteria, userData1)
      ).toBe(true);

      // Test below threshold
      const userData2 = { currentStreak: 4 };
      expect(
        achievementService.checkAchievementCriteria(criteria, userData2)
      ).toBe(false);
    });
  });
});
