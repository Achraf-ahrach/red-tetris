import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPut } from "@/lib/apiClient";
import { gameKeys } from "./keys";
import { authKeys } from "../auth/keys";

/**
 * Create a new game session
 */
export const useCreateGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameConfig) => {
      const response = await apiPost("/game/sessions", gameConfig);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to create game session"
        );
      }
      return response.session;
    },
    onSuccess: (newSession) => {
      // Add to sessions cache
      queryClient.setQueryData(gameKeys.session(newSession.id), newSession);
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: gameKeys.sessions() });
    },
  });
};

/**
 * Join an existing game session
 */
export const useJoinGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId) => {
      const response = await apiPost(`/game/sessions/${sessionId}/join`);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to join game session"
        );
      }
      return response.session;
    },
    onSuccess: (session) => {
      // Update session cache
      queryClient.setQueryData(gameKeys.session(session.id), session);
    },
  });
};

/**
 * Submit game score
 */
export const useSubmitScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scoreData) => {
      const response = await apiPost("/game/scores", scoreData);
      if (response.error) {
        throw new Error(response.data?.message || "Failed to submit score");
      }
      return response.score;
    },
    onSuccess: (scoreData) => {
      // Invalidate user stats and leaderboard
      queryClient.invalidateQueries({ queryKey: gameKeys.stats() });
      queryClient.invalidateQueries({ queryKey: gameKeys.leaderboard() });
      queryClient.invalidateQueries({
        queryKey: gameKeys.userHistory(scoreData.userId),
      });
    },
  });
};

/**
 * Update game session (for live game updates)
 */
export const useUpdateGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, updates }) => {
      const response = await apiPut(`/game/sessions/${sessionId}`, updates);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to update game session"
        );
      }
      return response.session;
    },
    onSuccess: (updatedSession) => {
      // Update session cache optimistically
      queryClient.setQueryData(
        gameKeys.session(updatedSession.id),
        updatedSession
      );
    },
  });
};

/**
 * Leave game session
 */
export const useLeaveGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId) => {
      const response = await apiPost(`/game/sessions/${sessionId}/leave`);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to leave game session"
        );
      }
      return response;
    },
    onSuccess: (_, sessionId) => {
      // Remove session from cache
      queryClient.removeQueries({ queryKey: gameKeys.session(sessionId) });
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: gameKeys.sessions() });
    },
  });
};
