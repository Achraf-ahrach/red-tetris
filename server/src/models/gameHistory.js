import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull().default(0),
  lines: integer("lines").notNull().default(0),
  duration: integer("duration").notNull().default(0), // in seconds
  result: varchar("result", { length: 16 }).notNull().default("loss"),
  level: integer("level").default(1),
  gameMode: varchar("game_mode", { length: 32 }).notNull().default("classic"), // classic, ranked, multiplayer
  opponentId: integer("opponent_id"), // For multiplayer games
  opponentName: varchar("opponent_name", { length: 255 }), // For multiplayer games
  roomName: varchar("room_name", { length: 255 }), // For multiplayer games
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const GAME_RESULT = {
  WIN: "win",
  LOSS: "loss",
  DRAW: "draw",
};

export const GAME_MODE = {
  CLASSIC: "classic",
  RANKED: "ranked",
  MULTIPLAYER: "multiplayer",
};
