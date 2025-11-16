// API service for user profile and game data using centralized apiClient
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import apiClient from "@/lib/apiClient";

const withQuery = (path, params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    )
  ).toString();
  return q ? `${path}?${q}` : path;
};

export const userAPI = {
  // Get comprehensive user profile data
  getCurrentUserProfile: async () => {
    return apiGet("/users/me/profile");
  },

  // Get current user basic info
  getCurrentUser: async () => {
    return apiGet("/users/me");
  },

  // Update user profile
  updateProfile: async (data) => {
    return apiPut("/users/me/profile", data);
  },

  // Update user password
  updatePassword: async (data) => {
    return apiPut("/users/me/password", data);
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await apiClient.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response?.data);
      return {
        error: true,
        status: err.response?.status,
        data: err.response?.data,
      };
    }
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
    return apiGet(withQuery("/users/leaderboard", { limit }));
  },

  // Get user game history
  getUserHistory: async (userId, { limit = 10, offset = 0 } = {}) => {
    return apiGet(withQuery(`/users/${userId}/history`, { limit, offset }));
  },
};

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
