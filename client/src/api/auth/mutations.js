import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPut } from "@/lib/apiClient";
import { authKeys, tokenUtils } from "./keys";

/**
 * Login with email and password
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const response = await apiPost("/auth/login", credentials);
      if (response.error) {
        throw new Error(response.data?.message || "Login failed");
      }
      return response;
    },
    onSuccess: (data) => {
      if (data.accessToken && data.refreshToken) {
        tokenUtils.setTokens(data.accessToken, data.refreshToken);
        // Invalidate auth queries to refetch user data
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
  });
};

/**
 * Register new user
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiPost("/auth/register", userData);
      if (response.error) {
        throw new Error(response.data?.message || "Registration failed");
      }
      return response;
    },
  });
};

/**
 * Refresh access token
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenUtils.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiPost("/auth/refresh", { refreshToken });
      if (response.error) {
        throw new Error(response.data?.message || "Token refresh failed");
      }
      return response;
    },
    onSuccess: (data) => {
      if (data.accessToken && data.refreshToken) {
        tokenUtils.setTokens(data.accessToken, data.refreshToken);
        // Invalidate auth queries to refetch with new token
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
    onError: () => {
      // Clear tokens and redirect to login on refresh failure
      tokenUtils.clearTokens();
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};

/**
 * Logout user
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiPost("/auth/logout", {});
      } catch (error) {
        // Continue with logout even if server request fails
        console.warn("Server logout failed:", error);
      }
    },
    onSettled: () => {
      // Always clear tokens and cache on logout
      tokenUtils.clearTokens();
      queryClient.clear();
      // Redirect to login (SPA-friendly)
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.replace("/login");
      }
    },
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiPut("/auth/me", userData);
      if (response.error) {
        throw new Error(response.data?.message || "Profile update failed");
      }
      return response.user;
    },
    onSuccess: (updatedUser) => {
      // Update the user data in cache
      queryClient.setQueryData(authKeys.me(), updatedUser);
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: authKeys.profile(updatedUser.id),
      });
    },
  });
};

/**
 * Change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData) => {
      const response = await apiPost("/auth/change-password", passwordData);
      if (response.error) {
        throw new Error(response.data?.message || "Password change failed");
      }
      return response;
    },
  });
};

/**
 * Handle OAuth success
 */
export const useOAuthLogin = () => {
  const queryClient = useQueryClient();

  return {
    handleOAuthSuccess: (accessToken, refreshToken) => {
      if (accessToken && refreshToken) {
        tokenUtils.setTokens(accessToken, refreshToken);
        // Invalidate auth queries to fetch user data
        queryClient.invalidateQueries({ queryKey: authKeys.all });
        return true;
      }
      return false;
    },
  };
};
