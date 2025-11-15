/**
 * useAuth Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useAuth } from "../useAuth";
import * as authApi from "@/api/auth";

// Mock the auth API
vi.mock("@/api/auth", () => ({
  useMe: vi.fn(),
  tokenUtils: {
    hasTokens: vi.fn(),
  },
}));

describe("useAuth", () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  it("should return user data when authenticated", () => {
    const mockUser = { id: 1, username: "testuser" };
    authApi.useMe.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
      isError: false,
    });
    authApi.tokenUtils.hasTokens.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasTokens).toBe(true);
  });

  it("should return loading state", () => {
    authApi.useMe.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      isError: false,
    });
    authApi.tokenUtils.hasTokens.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it("should return error state", () => {
    const mockError = new Error("Auth failed");
    authApi.useMe.mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
      isError: true,
    });
    authApi.tokenUtils.hasTokens.mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.hasTokens).toBe(false);
  });

  it("should check if user is authenticated", () => {
    const mockUser = { id: 1, username: "testuser" };
    authApi.useMe.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
      isError: false,
    });
    authApi.tokenUtils.hasTokens.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated()).toBe(true);
  });

  it("should return false when not authenticated", () => {
    authApi.useMe.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
    });
    authApi.tokenUtils.hasTokens.mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated()).toBe(false);
  });
});
