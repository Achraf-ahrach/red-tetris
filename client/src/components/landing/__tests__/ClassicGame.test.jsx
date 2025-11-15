/**
 * ClassicGame Component Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { ClassicGame } from "../ClassicGame";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  },
  useInView: () => true,
}));

describe.skip("ClassicGame", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render classic game section", () => {
    const { container } = render(<ClassicGame />);
    expect(container).toBeDefined();
  });

  it("should display classic mode title", () => {
    const { getByText } = render(<ClassicGame />);
    expect(getByText(/classic mode/i)).toBeDefined();
  });
});
