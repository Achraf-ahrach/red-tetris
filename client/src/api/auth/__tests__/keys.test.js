/**
 * Auth Keys and Token Utils Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { authKeys, tokenUtils } from "../keys";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("authKeys", () => {
  it("should have base all key", () => {
    expect(authKeys.all).toEqual(["auth"]);
  });

  it("should generate users key", () => {
    expect(authKeys.users()).toEqual(["auth", "users"]);
  });

  it("should generate user key", () => {
    expect(authKeys.user()).toEqual(["auth", "user"]);
  });

  it("should generate me key", () => {
    expect(authKeys.me()).toEqual(["auth", "user", "me"]);
  });

  it("should generate profile key with userId", () => {
    expect(authKeys.profile(123)).toEqual(["auth", "user", "profile", 123]);
  });

  it("should generate session key", () => {
    expect(authKeys.session()).toEqual(["auth", "session"]);
  });
});

describe("tokenUtils", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("getAccessToken", () => {
    it("should return access token from localStorage", () => {
      localStorageMock.setItem("accessToken", "test-access-token");
      
      const token = tokenUtils.getAccessToken();
      
      expect(token).toBe("test-access-token");
    });

    it("should return null if no token exists", () => {
      const token = tokenUtils.getAccessToken();
      
      expect(token).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error("localStorage error");
      });
      
      const token = tokenUtils.getAccessToken();
      
      expect(token).toBeNull();
    });
  });

  describe("getRefreshToken", () => {
    it("should return refresh token from localStorage", () => {
      localStorageMock.setItem("refreshToken", "test-refresh-token");
      
      const token = tokenUtils.getRefreshToken();
      
      expect(token).toBe("test-refresh-token");
    });

    it("should return null if no token exists", () => {
      const token = tokenUtils.getRefreshToken();
      
      expect(token).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error("localStorage error");
      });
      
      const token = tokenUtils.getRefreshToken();
      
      expect(token).toBeNull();
    });
  });

  describe("setTokens", () => {
    it("should store both tokens in localStorage", () => {
      tokenUtils.setTokens("access-123", "refresh-456");
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "accessToken",
        "access-123"
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-456"
      );
    });

    it("should only store access token if refresh token is not provided", () => {
      tokenUtils.setTokens("access-123", null);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "accessToken",
        "access-123"
      );
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
        "refreshToken",
        expect.anything()
      );
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("localStorage error");
      });
      
      expect(() => {
        tokenUtils.setTokens("access", "refresh");
      }).not.toThrow();
    });
  });

  describe("clearTokens", () => {
    it("should remove both tokens from localStorage", () => {
      localStorageMock.setItem("accessToken", "test");
      localStorageMock.setItem("refreshToken", "test");
      
      tokenUtils.clearTokens();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("accessToken");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("refreshToken");
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error("localStorage error");
      });
      
      expect(() => {
        tokenUtils.clearTokens();
      }).not.toThrow();
    });
  });

  describe("hasTokens", () => {
    it("should return true when both tokens exist", () => {
      localStorageMock.setItem("accessToken", "access");
      localStorageMock.setItem("refreshToken", "refresh");
      
      expect(tokenUtils.hasTokens()).toBe(true);
    });

    it("should return false when only access token exists", () => {
      localStorageMock.setItem("accessToken", "access");
      
      expect(tokenUtils.hasTokens()).toBe(false);
    });

    it("should return false when only refresh token exists", () => {
      localStorageMock.setItem("refreshToken", "refresh");
      
      expect(tokenUtils.hasTokens()).toBe(false);
    });

    it("should return false when no tokens exist", () => {
      expect(tokenUtils.hasTokens()).toBe(false);
    });
  });

  describe("hasAccessToken", () => {
    it("should return true when access token exists", () => {
      localStorageMock.setItem("accessToken", "test");
      
      expect(tokenUtils.hasAccessToken()).toBe(true);
    });

    it("should return false when no access token exists", () => {
      expect(tokenUtils.hasAccessToken()).toBe(false);
    });
  });

  describe("decodeToken", () => {
    it("should decode a valid JWT token", () => {
      // Sample JWT token with payload: {"userId": 123, "exp": 1234567890}
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZXhwIjoxMjM0NTY3ODkwfQ.xxxxx";
      
      const decoded = tokenUtils.decodeToken(token);
      
      expect(decoded).toHaveProperty("userId", 123);
      expect(decoded).toHaveProperty("exp", 1234567890);
    });

    it("should return null for invalid token", () => {
      const decoded = tokenUtils.decodeToken("invalid-token");
      
      expect(decoded).toBeNull();
    });

    it("should return null for null token", () => {
      const decoded = tokenUtils.decodeToken(null);
      
      expect(decoded).toBeNull();
    });

    it("should return null for empty string", () => {
      const decoded = tokenUtils.decodeToken("");
      
      expect(decoded).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for non-expired token", () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ exp: futureTime })
      )}.xxxxx`;
      
      const isExpired = tokenUtils.isTokenExpired(token);
      
      expect(isExpired).toBe(false);
    });

    it("should return true for expired token", () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ exp: pastTime })
      )}.xxxxx`;
      
      const isExpired = tokenUtils.isTokenExpired(token);
      
      expect(isExpired).toBe(true);
    });

    it("should return true for token without exp", () => {
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ userId: 123 })
      )}.xxxxx`;
      
      const isExpired = tokenUtils.isTokenExpired(token);
      
      expect(isExpired).toBe(true);
    });

    it("should return true for invalid token", () => {
      const isExpired = tokenUtils.isTokenExpired("invalid");
      
      expect(isExpired).toBe(true);
    });
  });
});
