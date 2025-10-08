import { apiGet, apiPost } from "@/lib/apiClient";

// API service for user profile and game data via centralized api client

// User profile API calls
export const userAPI = {
  // Get comprehensive user profile data
  getCurrentUserProfile: async () => {
    return apiGet("/users/me/profile");
  },

  // Get current user basic info
  getCurrentUser: async () => {
    return apiGet("/users/me");
  },

  // Complete a game
  completeGame: async (userId, gameData) => {
    return apiPost(`/users/${userId}/complete-game`, gameData);
  },

  // Get user statistics
  getUserStats: async (userId) => {
    return apiGet(`/users/${userId}/stats`);
  },

  // Get leaderboard (public)
  getLeaderboard: async (limit = 50) => {
    return apiGet(`/users/leaderboard?limit=${limit}`);
  },
};

// Achievement API calls
export const achievementAPI = {
  // Get user's unlocked achievements
  getUserAchievements: async (userId) => {
    return apiGet(`/achievements/user/${userId}`);
  },

  // Check for new achievements
  checkAchievements: async (userId) => {
    return apiPost(`/achievements/user/${userId}/check`, {});
  },
};

export default { userAPI, achievementAPI };
