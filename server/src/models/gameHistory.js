import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull().default(0),
  lines: integer("lines").notNull().default(0),
  duration: integer("duration").notNull().default(0),
  result: varchar("result", { length: 16 }).notNull().default("loss"),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const GAME_RESULT = {
  WIN: "win",
  LOSS: "loss",
};
