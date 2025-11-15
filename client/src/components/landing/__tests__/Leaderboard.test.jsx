/**
 * Leaderboard Component Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { Leaderboard } from "../Leaderboard";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  },
  useInView: () => true,
}));

describe.skip("Leaderboard", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render leaderboard section", () => {
    const { container } = render(<Leaderboard />);
    expect(container).toBeDefined();
  });

  it("should display leaderboard title", () => {
    const { getByText } = render(<Leaderboard />);
    expect(getByText(/leaderboard/i)).toBeDefined();
  });
});
