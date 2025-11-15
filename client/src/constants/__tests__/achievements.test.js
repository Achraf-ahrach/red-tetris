import { describe, it, expect } from "vitest";
import {
  ACHIEVEMENTS,
  getAchievementDetails,
  getAllAchievements,
  getUserAchievementsWithDetails,
} from "../achievements";

describe("Achievements", () => {
  describe("ACHIEVEMENTS object", () => {
    it("should have all required achievement properties", () => {
      Object.values(ACHIEVEMENTS).forEach((achievement) => {
        expect(achievement).toHaveProperty("name");
        expect(achievement).toHaveProperty("description");
        expect(achievement).toHaveProperty("icon");
        expect(achievement).toHaveProperty("rarity");
      });
    });

    it("should have valid rarity levels", () => {
      const validRarities = ["common", "rare", "epic", "legendary"];

      Object.values(ACHIEVEMENTS).forEach((achievement) => {
        expect(validRarities).toContain(achievement.rarity);
      });
    });

    it("should have unique achievement names", () => {
      const names = Object.values(ACHIEVEMENTS).map((a) => a.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it("should contain expected achievements", () => {
      expect(ACHIEVEMENTS.first_game).toBeDefined();
      expect(ACHIEVEMENTS.first_win).toBeDefined();
      expect(ACHIEVEMENTS.win_streak_5).toBeDefined();
      expect(ACHIEVEMENTS.score_1000).toBeDefined();
      expect(ACHIEVEMENTS.level_10).toBeDefined();
    });
  });

  describe("getAchievementDetails", () => {
    it("should return achievement details for valid name", () => {
      const achievement = getAchievementDetails("first_game");

      expect(achievement).toEqual({
        name: "First Game",
        description: "Play your first game",
        icon: "🎮",
        rarity: "common",
      });
    });

    it("should return null for invalid achievement name", () => {
      const achievement = getAchievementDetails("invalid_achievement");
      expect(achievement).toBeNull();
    });

    it("should return correct details for score achievement", () => {
      const achievement = getAchievementDetails("score_5000");

      expect(achievement.name).toBe("High Scorer");
      expect(achievement.description).toBe("Score 5,000 points");
      expect(achievement.rarity).toBe("rare");
    });

    it("should return correct details for legendary achievement", () => {
      const achievement = getAchievementDetails("level_50");

      expect(achievement.rarity).toBe("legendary");
      expect(achievement.name).toBe("Tetris Master");
    });
  });

  describe("getAllAchievements", () => {
    it("should return array of all achievements", () => {
      const achievements = getAllAchievements();

      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
    });

    it("should include id property for each achievement", () => {
      const achievements = getAllAchievements();

      achievements.forEach((achievement) => {
        expect(achievement).toHaveProperty("id");
        expect(achievement).toHaveProperty("name");
        expect(achievement).toHaveProperty("description");
        expect(achievement).toHaveProperty("icon");
        expect(achievement).toHaveProperty("rarity");
      });
    });

    it("should have correct id mapping", () => {
      const achievements = getAllAchievements();
      const firstGame = achievements.find((a) => a.id === "first_game");

      expect(firstGame.name).toBe("First Game");
      expect(firstGame.icon).toBe("🎮");
    });

    it("should return same number of achievements as ACHIEVEMENTS object", () => {
      const achievements = getAllAchievements();
      const achievementKeys = Object.keys(ACHIEVEMENTS);

      expect(achievements.length).toBe(achievementKeys.length);
    });
  });

  describe("getUserAchievementsWithDetails", () => {
    it("should mark unlocked achievements correctly", () => {
      const unlockedAchievements = ["first_game", "score_1000"];
      const result = getUserAchievementsWithDetails(unlockedAchievements);

      const firstGame = result.find((a) => a.id === "first_game");
      const firstWin = result.find((a) => a.id === "first_win");

      expect(firstGame.unlocked).toBe(true);
      expect(firstWin.unlocked).toBe(false);
    });

    it("should handle empty unlocked achievements array", () => {
      const result = getUserAchievementsWithDetails([]);

      result.forEach((achievement) => {
        expect(achievement.unlocked).toBe(false);
      });
    });

    it("should handle undefined unlocked achievements", () => {
      const result = getUserAchievementsWithDetails();

      result.forEach((achievement) => {
        expect(achievement.unlocked).toBe(false);
      });
    });

    it("should include all achievement details", () => {
      const unlockedAchievements = ["first_game"];
      const result = getUserAchievementsWithDetails(unlockedAchievements);

      result.forEach((achievement) => {
        expect(achievement).toHaveProperty("id");
        expect(achievement).toHaveProperty("name");
        expect(achievement).toHaveProperty("description");
        expect(achievement).toHaveProperty("icon");
        expect(achievement).toHaveProperty("rarity");
        expect(achievement).toHaveProperty("unlocked");
        expect(typeof achievement.unlocked).toBe("boolean");
      });
    });

    it("should mark all achievements as unlocked when all are provided", () => {
      const allIds = Object.keys(ACHIEVEMENTS);
      const result = getUserAchievementsWithDetails(allIds);

      result.forEach((achievement) => {
        expect(achievement.unlocked).toBe(true);
      });
    });

    it("should return all achievements even with partial unlock list", () => {
      const unlockedAchievements = ["first_game", "first_win"];
      const result = getUserAchievementsWithDetails(unlockedAchievements);

      expect(result.length).toBe(Object.keys(ACHIEVEMENTS).length);
    });
  });
});
