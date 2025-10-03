import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../models/user.js";

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

  async create(userData) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
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
}
