import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { authKeys, tokenUtils } from "./keys";

/**
 * Get current authenticated user
 */
export const useMe = (options = {}) => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await apiGet("/auth/me");
      if (response.error) {
        throw new Error(response.data?.message || "Failed to fetch user");
      }
      return response.user;
    },
    enabled: tokenUtils.hasTokens(),
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    ...options,
  });
};

/**
 * Get user profile by ID
 */
export const useUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: authKeys.profile(userId),
    queryFn: async () => {
      const response = await apiGet(`/users/${userId}`);
      if (response.error) {
        throw new Error(
          response.data?.message || "Failed to fetch user profile"
        );
      }
      return response.user;
    },
    enabled: !!userId && tokenUtils.hasTokens(),
    staleTime: 10 * 60 * 1000, 
    ...options,
  });
};

