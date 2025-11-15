/**
 * HeroSection Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { HeroSection } from "../HeroSection";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useTransform: () => ({ get: () => 0 }),
}));

describe.skip("HeroSection", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render hero section", () => {
    const { container } = render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it("should display title", () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );
    expect(screen.getByText(/TETRIS/i)).toBeDefined();
  });

  it("should display play button", () => {
    render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );
    expect(screen.getByText(/start playing/i)).toBeDefined();
  });
});
