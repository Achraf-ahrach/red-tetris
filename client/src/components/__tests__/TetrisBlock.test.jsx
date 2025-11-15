/**
 * TetrisBlock Component Tests
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { TetrisBlock } from "../TetrisBlock";

describe("TetrisBlock", () => {
  it("should render with default size", () => {
    const { container } = render(<TetrisBlock color="#ff0000" />);
    const block = container.querySelector("div");
    expect(block).toBeDefined();
    expect(block.style.width).toBe("20px");
    expect(block.style.height).toBe("20px");
  });

  it("should render with custom size", () => {
    const { container } = render(<TetrisBlock color="#00ff00" size={30} />);
    const block = container.querySelector("div");
    expect(block.style.width).toBe("30px");
    expect(block.style.height).toBe("30px");
  });

  it("should apply color to background", () => {
    const { container } = render(<TetrisBlock color="#0000ff" />);
    const block = container.querySelector("div");
    expect(block.style.backgroundColor).toBe("rgb(0, 0, 255)");
  });

  it("should have proper CSS classes", () => {
    const { container } = render(<TetrisBlock color="#ffff00" />);
    const block = container.querySelector("div");
    expect(block.className).toContain("rounded-sm");
    expect(block.className).toContain("border");
  });
});
