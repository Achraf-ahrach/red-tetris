// Achievement definitions with names, descriptions, icons, and rarity
export const ACHIEVEMENTS = {
  first_game: {
    name: "First Game",
    description: "Play your first game",
    icon: "🎮",
    rarity: "common",
  },
  first_win: {
    name: "First Victory",
    description: "Win your first game",
    icon: "🏆",
    rarity: "common",
  },
  win_streak_5: {
    name: "Streak Master",
    description: "Win 5 games in a row",
    icon: "🔥",
    rarity: "rare",
  },
  win_streak_10: {
    name: "Unstoppable",
    description: "Win 10 games in a row",
    icon: "⚡",
    rarity: "epic",
  },
  score_1000: {
    name: "Rising Star",
    description: "Score 1,000 points",
    icon: "⭐",
    rarity: "common",
  },
  score_5000: {
    name: "High Scorer",
    description: "Score 5,000 points",
    icon: "🌟",
    rarity: "rare",
  },
  score_10000: {
    name: "Score Legend",
    description: "Score 10,000 points",
    icon: "💎",
    rarity: "epic",
  },
  lines_100: {
    name: "Line Clearer",
    description: "Clear 100 lines",
    icon: "📏",
    rarity: "common",
  },
  lines_500: {
    name: "Line Master",
    description: "Clear 500 lines",
    icon: "🎯",
    rarity: "rare",
  },
  lines_1000: {
    name: "Line Legend",
    description: "Clear 1,000 lines",
    icon: "👑",
    rarity: "epic",
  },
  play_time_1h: {
    name: "Dedicated Player",
    description: "Play for 1 hour total",
    icon: "⏰",
    rarity: "common",
  },
  play_time_10h: {
    name: "Tetris Addict",
    description: "Play for 10 hours total",
    icon: "🕐",
    rarity: "rare",
  },
  level_10: {
    name: "Level Up",
    description: "Reach level 10",
    icon: "📈",
    rarity: "common",
  },
  level_25: {
    name: "Expert Player",
    description: "Reach level 25",
    icon: "🎓",
    rarity: "rare",
  },
  level_50: {
    name: "Tetris Master",
    description: "Reach level 50",
    icon: "👨‍🎓",
    rarity: "legendary",
  },
};

// Helper function to get achievement details from name
export const getAchievementDetails = (achievementName) => {
  return ACHIEVEMENTS[achievementName] || null;
};

// Get all achievements as array for displaying achievement grid
export const getAllAchievements = () => {
  return Object.entries(ACHIEVEMENTS).map(([key, achievement]) => ({
    id: key,
    ...achievement,
  }));
};

// Get user's unlocked achievements with details
export const getUserAchievementsWithDetails = (unlockedAchievements = []) => {
  return getAllAchievements().map((achievement) => ({
    ...achievement,
    unlocked: unlockedAchievements.includes(achievement.id),
  }));
};
