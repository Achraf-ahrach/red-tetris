/**
 * GameStats Component Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import GameStats from "../GameStats";

describe.skip("GameStats", () => {
  const mockStats = {
    score: 1000,
    level: 5,
    lines: 20,
  };

  beforeEach(() => {
    cleanup();
  });

  it("should render game stats", () => {
    const { container } = render(<GameStats {...mockStats} />);
    expect(container).toBeDefined();
  });

  it("should display score", () => {
    render(<GameStats {...mockStats} />);
    expect(screen.getByText(/score/i)).toBeDefined();
  });

  it("should display level", () => {
    render(<GameStats {...mockStats} />);
    expect(screen.getByText(/level/i)).toBeDefined();
  });

  it("should display lines", () => {
    render(<GameStats {...mockStats} />);
    expect(screen.getByText(/lines/i)).toBeDefined();
  });

  it("should display numeric values", () => {
    render(<GameStats {...mockStats} />);
    expect(screen.getByText("1000")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("20")).toBeDefined();
  });
});
