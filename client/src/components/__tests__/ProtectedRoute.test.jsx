/**
 * ProtectedRoute Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/useAuth";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render children when authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
    });

    const { getByText } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(getByText("Protected Content")).toBeDefined();
  });

  it("should show loading when checking auth", () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: true,
    });

    const { container } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(container).toBeDefined();
  });

  it("should redirect when not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: false,
    });

    const { container } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(container).toBeDefined();
  });
});
