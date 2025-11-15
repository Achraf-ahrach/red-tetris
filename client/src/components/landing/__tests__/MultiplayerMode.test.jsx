/**
 * MultiplayerMode Component Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { MultiplayerMode } from "../MultiplayerMode";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  },
  useInView: () => true,
}));

describe.skip("MultiplayerMode", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render multiplayer mode section", () => {
    const { container } = render(<MultiplayerMode />);
    expect(container).toBeDefined();
  });

  it("should display multiplayer title", () => {
    const { getByText } = render(<MultiplayerMode />);
    expect(getByText(/multiplayer/i)).toBeDefined();
  });
});
