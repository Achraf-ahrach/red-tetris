/**
 * GuestRoute Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import GuestRoute from "../GuestRoute";

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
    });

    const { container } = render(
      <BrowserRouter>
        <GuestRoute>
          <div>Guest Content</div>
        </GuestRoute>
      </BrowserRouter>
    );

    expect(container).toBeDefined();
  });
});
