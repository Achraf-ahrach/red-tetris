import { db } from "../config/database.js";
import { userAchievements, achievements, users } from "../models/user.js";
import { eq, and } from "drizzle-orm";

export class UserAchievementRepository {
  // Get all achievements for a user with unlock status
  async findUserAchievements(userId) {
    const result = await db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        rarity: achievements.rarity,
        criteria: achievements.criteria,
        unlocked: userAchievements.unlockedAt,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(achievements)
      .leftJoin(
        userAchievements,
        and(
          eq(userAchievements.achievementId, achievements.id),
          eq(userAchievements.userId, userId)
        )
      )
      .where(eq(achievements.isActive, true));

    return result.map((achievement) => ({
      ...achievement,
      unlocked: !!achievement.unlocked,
    }));
  }

  // Check if user has specific achievement
  async hasAchievement(userId, achievementId) {
    const result = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
    return result.length > 0;
  }

  // Unlock achievement for user
  async unlockAchievement(userId, achievementId) {
    // Check if already unlocked
    const hasAchievement = await this.hasAchievement(userId, achievementId);
    if (hasAchievement) {
      return null; // Already unlocked
    }

    const result = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
      })
      .returning();

    return result[0];
  }

  // Get user's unlocked achievements count by rarity
  async getAchievementStats(userId) {
    const result = await db
      .select({
        rarity: achievements.rarity,
        count: db.count(),
      })
      .from(userAchievements)
      .innerJoin(
        achievements,
        eq(userAchievements.achievementId, achievements.id)
      )
      .where(eq(userAchievements.userId, userId))
      .groupBy(achievements.rarity);

    return result;
  }
}
