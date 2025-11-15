/**
 * BoardGlass Component Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import BoardGlass from "../BoardGlass";

describe("BoardGlass", () => {
  const mockBoard = Array(20)
    .fill(null)
    .map(() => Array(10).fill(0));

  beforeEach(() => {
    cleanup();
  });

  it("should render board glass", () => {
    const { container } = render(<BoardGlass board={mockBoard} />);
    expect(container).toBeDefined();
  });

  it("should render with custom className", () => {
    const { container } = render(
      <BoardGlass board={mockBoard} className="custom-class" />
    );
    expect(container).toBeDefined();
  });

  it("should handle empty board", () => {
    const emptyBoard = [];
    const { container } = render(<BoardGlass board={emptyBoard} />);
    expect(container).toBeDefined();
  });
});
