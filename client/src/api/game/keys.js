/**
 * Game Query Keys
 * Centralized query key factory for game-related queries
 */
export const gameKeys = {
  // Base key for all game queries
  all: ["game"],

  // Game session keys
  sessions: () => [...gameKeys.all, "sessions"],
  session: (sessionId) => [...gameKeys.sessions(), sessionId],

  // Game stats keys
  stats: () => [...gameKeys.all, "stats"],
  userStats: (userId) => [...gameKeys.stats(), "user", userId],

  // Leaderboard keys
  leaderboard: () => [...gameKeys.all, "leaderboard"],
  leaderboardByMode: (mode) => [...gameKeys.leaderboard(), mode],

  // Game history keys
  history: () => [...gameKeys.all, "history"],
  userHistory: (userId) => [...gameKeys.history(), "user", userId],
};
