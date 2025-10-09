import { eq, gt, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../models/user.js";
import { gameHistory } from "../models/gameHistory.js";

export class UserRepository {
  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async findByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async findByUsername(username) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return result[0] || null;
  }

  async findByFortyTwoId(fortyTwoId) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.fortyTwoId, fortyTwoId));
    return result[0] || null;
  }

  // Alias methods for compatibility
  async createUser(userData) {
    return await this.create(userData);
  }

  async updateUser(id, userData) {
    return await this.update(id, userData);
  }

  async getUserById(id) {
    return await this.findById(id);
  }

  async create(userData) {
    try {

      const result = await db.insert(users).values(userData).returning();

      if (!result || result.length === 0) {
        throw new Error(
          "Insert operation returned empty result - user may not have been created"
        );
      }

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async update(id, userData) {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async delete(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0];
  }

  async findAll() {
    return await db.select().from(users);
  }

  async getLeaderboard(limit = 50) {
    return await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        highScore: users.highScore,
        totalGames: users.totalGames,
        totalWins: users.totalWins,
        totalLosses: users.totalLosses,
        level: users.level,
      })
      .from(users)
      .where(gt(users.totalGames, 0))
      .orderBy(desc(users.highScore))
      .limit(limit);
  }

  async addGameHistory(entry) {
    const [row] = await db.insert(gameHistory).values(entry).returning();
    return row;
  }

  async getGameHistoryByUser(userId, { limit = 20, offset = 0 } = {}) {
    const rows = await db
      .select()
      .from(gameHistory)
      .where(eq(gameHistory.userId, userId))
      .orderBy(desc(gameHistory.createdAt))
      .limit(limit)
      .offset(offset);
    return rows;
  }
}
