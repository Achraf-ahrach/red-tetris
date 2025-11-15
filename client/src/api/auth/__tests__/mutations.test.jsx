/**
 * Auth Mutations Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useLogin,
  useRegister,
  useRefreshToken,
  useLogout,
  useUpdateProfile,
  useChangePassword,
} from "../mutations";
import * as apiClient from "@/lib/apiClient";
import { tokenUtils } from "../keys";

// Mock apiClient
vi.mock("@/lib/apiClient", () => ({
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

// Mock tokenUtils
vi.mock("../keys", async () => {
  const actual = await vi.importActual("../keys");
  return {
    ...actual,
    tokenUtils: {
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
      getRefreshToken: vi.fn(),
      getAccessToken: vi.fn(),
    },
  };
});

describe("Auth Mutations", () => {
  let queryClient;
  let wrapper;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    // Mock window.location
    delete window.location;
    window.location = { href: "" };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe("useLogin", () => {
    it("should login successfully", async () => {
      const mockResponse = {
        accessToken: "access-token-123",
        refreshToken: "refresh-token-123",
        user: { id: 1, email: "test@test.com" },
      };
      apiClient.apiPost.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useLogin(), { wrapper });

      result.current.mutate({ email: "test@test.com", password: "password" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(tokenUtils.setTokens).toHaveBeenCalledWith(
        "access-token-123",
        "refresh-token-123"
      );
      expect(apiClient.apiPost).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "password",
      });
    });

    it("should handle login error", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Invalid credentials" },
      });

      const { result } = renderHook(() => useLogin(), { wrapper });

      result.current.mutate({ email: "test@test.com", password: "wrong" });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Invalid credentials");
      expect(tokenUtils.setTokens).not.toHaveBeenCalled();
    });
  });

  describe("useRegister", () => {
    it("should register successfully", async () => {
      const mockResponse = {
        user: { id: 1, email: "new@test.com" },
      };
      apiClient.apiPost.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRegister(), { wrapper });

      result.current.mutate({
        email: "new@test.com",
        password: "password",
        username: "testuser",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.apiPost).toHaveBeenCalledWith("/auth/register", {
        email: "new@test.com",
        password: "password",
        username: "testuser",
      });
    });

    it("should handle registration error", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Email already exists" },
      });

      const { result } = renderHook(() => useRegister(), { wrapper });

      result.current.mutate({
        email: "existing@test.com",
        password: "password",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Email already exists");
    });
  });

  describe("useRefreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };
      tokenUtils.getRefreshToken.mockReturnValue("old-refresh-token");
      apiClient.apiPost.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRefreshToken(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(tokenUtils.setTokens).toHaveBeenCalledWith(
        "new-access-token",
        "new-refresh-token"
      );
      expect(apiClient.apiPost).toHaveBeenCalledWith("/auth/refresh", {
        refreshToken: "old-refresh-token",
      });
    });

    it("should handle missing refresh token", async () => {
      tokenUtils.getRefreshToken.mockReturnValue(null);

      const { result } = renderHook(() => useRefreshToken(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("No refresh token available");
    });

    it("should handle refresh error and redirect to login", async () => {
      tokenUtils.getRefreshToken.mockReturnValue("old-refresh-token");
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Token expired" },
      });

      const { result } = renderHook(() => useRefreshToken(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(tokenUtils.clearTokens).toHaveBeenCalled();
      expect(window.location.href).toBe("/login");
    });
  });

  describe("useLogout", () => {
    it("should logout successfully", async () => {
      apiClient.apiPost.mockResolvedValue({});

      const { result } = renderHook(() => useLogout(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(tokenUtils.clearTokens).toHaveBeenCalled();
      expect(apiClient.apiPost).toHaveBeenCalledWith("/auth/logout", {});
    });

    it("should clear tokens even if server request fails", async () => {
      apiClient.apiPost.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useLogout(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(tokenUtils.clearTokens).toHaveBeenCalled();
    });
  });

  describe("useUpdateProfile", () => {
    it("should update profile successfully", async () => {
      const mockUser = { id: 1, email: "updated@test.com", username: "updated" };
      apiClient.apiPut.mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      result.current.mutate({ username: "updated" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockUser);
      expect(apiClient.apiPut).toHaveBeenCalledWith("/auth/me", {
        username: "updated",
      });
    });

    it("should handle profile update error", async () => {
      apiClient.apiPut.mockResolvedValue({
        error: true,
        data: { message: "Update failed" },
      });

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      result.current.mutate({ username: "invalid" });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Update failed");
    });
  });

  describe("useChangePassword", () => {
    it("should change password successfully", async () => {
      const mockResponse = { message: "Password changed" };
      apiClient.apiPost.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChangePassword(), { wrapper });

      result.current.mutate({
        oldPassword: "old123",
        newPassword: "new123",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.apiPost).toHaveBeenCalledWith("/auth/change-password", {
        oldPassword: "old123",
        newPassword: "new123",
      });
    });

    it("should handle password change error", async () => {
      apiClient.apiPost.mockResolvedValue({
        error: true,
        data: { message: "Incorrect old password" },
      });

      const { result } = renderHook(() => useChangePassword(), { wrapper });

      result.current.mutate({
        oldPassword: "wrong",
        newPassword: "new123",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe("Incorrect old password");
    });
  });
});
