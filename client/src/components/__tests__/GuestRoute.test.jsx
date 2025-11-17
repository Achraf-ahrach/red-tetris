/**
 * GuestRoute Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import GuestRoute from "../GuestRoute";

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

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/useAuth";

describe("GuestRoute", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render children when not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: false,
    });

    const { getByText } = render(
      <BrowserRouter>
        <GuestRoute>
          <div>Guest Content</div>
        </GuestRoute>
      </BrowserRouter>
    );

    expect(getByText("Guest Content")).toBeDefined();
  });

  it("should redirect when authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false,
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <GuestRoute>
          <div>Guest Content</div>
        </GuestRoute>
      </BrowserRouter>
    );

    // Should show redirect component instead of children
    const redirectElement = getByTestId("navigate-redirect");
    expect(redirectElement).toBeDefined();
    expect(redirectElement.getAttribute("data-redirect-to")).toBe("/profile");
  });
});
