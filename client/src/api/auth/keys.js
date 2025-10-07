/**
 * Auth Query Keys
 * Centralized query key factory for auth-related queries
 */
export const authKeys = {
  // Base key for all auth queries
  all: ["auth"],

  // User-related keys
  users: () => [...authKeys.all, "users"],
  user: () => [...authKeys.all, "user"],
  me: () => [...authKeys.user(), "me"],
  profile: (userId) => [...authKeys.user(), "profile", userId],

  // Session-related keys
  session: () => [...authKeys.all, "session"],
};

/**
 * Token Management Utilities
 * Centralized token handling with error handling
 */
export const tokenUtils = {
  /**
   * Get access token from localStorage
   */
  getAccessToken: () => {
    try {
      return localStorage.getItem("accessToken");
    } catch (error) {
      return null;
    }
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: () => {
    try {
      return localStorage.getItem("refreshToken");
    } catch (error) {
      return null;
    }
  },

  /**
   * Store tokens in localStorage
   */
  setTokens: (accessToken, refreshToken) => {
    try {
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    } catch (error) {
    }
  },

  /**
   * Clear all tokens from localStorage
   */
  clearTokens: () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch (error) {
    }
  },

  /**
   * Check if user has both tokens
   */
  hasTokens: () => {
    const accessToken = tokenUtils.getAccessToken();
    const refreshToken = tokenUtils.getRefreshToken();
    return !!(accessToken && refreshToken);
  },

  /**
   * Check if access token exists (quick check)
   */
  hasAccessToken: () => {
    return !!tokenUtils.getAccessToken();
  },

  /**
   * Decode token payload (basic, no verification)
   * Use only for client-side display purposes
   */
  decodeToken: (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if token is expired (client-side check only)
   */
  isTokenExpired: (token) => {
    const decoded = tokenUtils.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },
};
