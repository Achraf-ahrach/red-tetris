import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  json,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  avatar: text("avatar"),

  totalGames: integer("total_games").default(0),
  totalWins: integer("total_wins").default(0),
  totalLosses: integer("total_losses").default(0),
  highScore: integer("high_score").default(0),
  totalLines: integer("total_lines").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalPlayTime: integer("total_play_time").default(0), 
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  achievements: json("achievements").default([]), 

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ACHIEVEMENTS = {
  FIRST_GAME: "first_game",
  FIRST_WIN: "first_win",
  WIN_STREAK_5: "win_streak_5",
  WIN_STREAK_10: "win_streak_10",
  SCORE_1000: "score_1000",
  SCORE_5000: "score_5000",
  SCORE_10000: "score_10000",
  LINES_100: "lines_100",
  LINES_500: "lines_500",
  LINES_1000: "lines_1000",
  PLAY_TIME_1H: "play_time_1h",
  PLAY_TIME_10H: "play_time_10h",
  LEVEL_10: "level_10",
  LEVEL_25: "level_25",
  LEVEL_50: "level_50",
};
