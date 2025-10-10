import "dotenv/config";
import { db } from "../config/database.js";
import { users } from "../models/user.js";
import { gameHistory } from "../models/gameHistory.js";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function upsertUser({
  email,
  username,
  firstName,
  lastName,
  password,
  avatar,
}) {
  const hashed = password ? await bcrypt.hash(password, 12) : null;
  const insert = await db
    .insert(users)
    .values({ email, username, firstName, lastName, password: hashed, avatar })
    .onConflictDoNothing()
    .returning();

  if (insert.length) return insert[0];

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return existing;
}

async function addHistory(userId, entries) {
  for (const e of entries) {
    await db.insert(gameHistory).values({ userId, ...e });
  }
}

async function main() {
  console.log("Seeding users and game history...");

  const userA = await upsertUser({
    email: "alice@example.com",
    username: "alice",
    firstName: "Alice",
    lastName: "Player",
    password: "password123",
    avatar: "",
  });

  const userB = await upsertUser({
    email: "bob@example.com",
    username: "bob",
    firstName: "Bob",
    lastName: "Gamer",
    password: "password123",
    avatar: "",
  });

  await addHistory(userA.id, [
    { score: 1200, lines: 30, duration: 600, result: "win", level: 5 },
    { score: 800, lines: 20, duration: 520, result: "loss", level: 4 },
    { score: 3000, lines: 60, duration: 1200, result: "win", level: 8 },
  ]);

  await addHistory(userB.id, [
    { score: 1500, lines: 35, duration: 700, result: "win", level: 6 },
    { score: 4500, lines: 80, duration: 1500, result: "win", level: 10 },
    { score: 600, lines: 15, duration: 400, result: "loss", level: 3 },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
