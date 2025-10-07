import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { gameKeys } from "./keys";
import { tokenUtils } from "../auth/keys";

/**
 * Get current game session
 */
export const useGameSession = (sessionId, options = {}) => {
  return useQuery({
    queryKey: gameKeys.session(sessionId),
    queryFn: async () => {
      const response = await apiGet(`/game/sessions/${sessionId}`);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to fetch game session"
        );
      }
      return response.session;
    },
    enabled: !!sessionId && tokenUtils.hasTokens(),
    staleTime: 30 * 1000, // 30 seconds for live game data
    ...options,
  });
};

/**
 * Get user game statistics
 */
export const useUserStats = (userId, options = {}) => {
  return useQuery({
    queryKey: gameKeys.userStats(userId),
    queryFn: async () => {
      const response = await apiGet(`/game/stats/user/${userId}`);
      if (response.error) {
        throw new Error(response.data?.message || "Failed to fetch user stats");
      }
      return response.stats;
    },
    enabled: !!userId && tokenUtils.hasTokens(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get leaderboard
 */
export const useLeaderboard = (mode = "classic", options = {}) => {
  return useQuery({
    queryKey: gameKeys.leaderboardByMode(mode),
    queryFn: async () => {
      const response = await apiGet(`/game/leaderboard?mode=${mode}`);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to fetch leaderboard"
        );
      }
      return response.leaderboard;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Get user game history
 */
export const useUserGameHistory = (userId, options = {}) => {
  return useQuery({
    queryKey: gameKeys.userHistory(userId),
    queryFn: async () => {
      const response = await apiGet(`/game/history/user/${userId}`);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to fetch game history"
        );
      }
      return response.history;
    },
    enabled: !!userId && tokenUtils.hasTokens(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
