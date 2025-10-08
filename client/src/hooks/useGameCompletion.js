import { useState } from "react";
import { userAPI } from "../services/api";

// Custom hook for handling game completion
export const useGameCompletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const completeGame = async (gameData) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user to get their ID
      const userResponse = await userAPI.getCurrentUser();
      const userId = userResponse?.data?.id;
      if (!userId) {
        throw new Error("Failed to get user information");
      }

      // Complete the game
      const gameResponse = await userAPI.completeGame(userId, gameData);

      if (gameResponse?.data) {
        return {
          success: true,
          data: gameResponse.data,
          message: gameResponse.message || "Game completed successfully!",
        };
      }

      throw new Error(gameResponse?.data?.message || "Failed to complete game");
    } catch (err) {
      const errorMessage =
        err?.message || "An error occurred while completing the game";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    completeGame,
    loading,
    error,
  };
};

export default useGameCompletion;
