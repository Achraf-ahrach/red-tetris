/**
 * ProtectedRoute Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

// Mock React Router Navigate component to prevent hanging
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to, children }) => (
      <div data-testid="navigate-redirect" data-redirect-to={to}>
        {children}
      </div>
    ),
    useLocation: () => ({ pathname: "/test" }),
  };
});

// Mock ProtectedLayout to avoid complex component rendering
vi.mock("@/layouts/ProtectedLayout", () => ({
  default: ({ children }) => (
    <div data-testid="protected-layout">{children}</div>
  ),
}));

// Mock Lucide React icons to avoid animation issues
vi.mock("lucide-react", () => ({
  Loader2: ({ className }) => (
    <div data-testid="loading-spinner" className={className}>
      Loading...
    </div>
  ),
}));

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
      user: { id: 1, username: "testuser" },
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
      user: null,
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(getByTestId("loading-spinner")).toBeDefined();
  });

  it("should redirect when not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: false,
      user: null,
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Should show redirect component instead of children
    const redirectElement = getByTestId("navigate-redirect");
    expect(redirectElement).toBeDefined();
    expect(redirectElement.getAttribute("data-redirect-to")).toBe("/login");
  });
});
