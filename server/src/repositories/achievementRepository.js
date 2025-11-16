import { db } from "../config/database.js";
import { achievements } from "../models/user.js";
import { eq } from "drizzle-orm";

export class AchievementRepository {
  // Get all available achievements
  async findAll() {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true));
  }

  // Get achievement by ID
  async findById(id) {
    const result = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return result[0];
  }

  // Create new achievement
  async create(achievementData) {
    const result = await db
      .insert(achievements)
      .values(achievementData)
      .returning();
    return result[0];
  }

  // Update achievement
  async update(id, achievementData) {
    const result = await db
      .update(achievements)
      .set(achievementData)
      .where(eq(achievements.id, id))
      .returning();
    return result[0];
  }

  // Delete achievement
  async delete(id) {
    const result = await db
      .update(achievements)
      .set({ isActive: false })
      .where(eq(achievements.id, id))
      .returning();
    return result[0];
  }
}
