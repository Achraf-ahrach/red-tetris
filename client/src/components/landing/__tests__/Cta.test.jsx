/**
 * CTA Component Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CTA } from "../Cta";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  useInView: () => true,
}));

describe.skip("CTA", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render CTA section", () => {
    const { container } = render(
      <BrowserRouter>
        <CTA />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it("should display call to action", () => {
    const { getByText } = render(
      <BrowserRouter>
        <CTA />
      </BrowserRouter>
    );
    expect(getByText(/ready/i)).toBeDefined();
  });
});
