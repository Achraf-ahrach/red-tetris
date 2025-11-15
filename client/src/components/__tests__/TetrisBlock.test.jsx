/**
 * TetrisBlock Component Tests
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TetrisBlock } from "../TetrisBlock";

describe("TetrisBlock Component", () => {
  it("should render with default size", () => {
    const { container } = render(<TetrisBlock color="#00f0f0" />);
    const block = container.firstChild;
    
    expect(block).toBeTruthy();
    expect(block.style.width).toBe("20px");
    expect(block.style.height).toBe("20px");
  });

  it("should render with custom size", () => {
    const { container } = render(<TetrisBlock color="#ff0000" size={30} />);
    const block = container.firstChild;
    
    expect(block.style.width).toBe("30px");
    expect(block.style.height).toBe("30px");
  });

  it("should apply color to background", () => {
    const testColor = "#00ff00";
    const { container } = render(<TetrisBlock color={testColor} />);
    const block = container.firstChild;
    
    expect(block.style.backgroundColor).toBe("rgb(0, 255, 0)");
  });

  it("should have proper CSS classes", () => {
    const { container } = render(<TetrisBlock color="#0000ff" />);
    const block = container.firstChild;
    
    expect(block.className).toContain("rounded-sm");
    expect(block.className).toContain("border");
  });

  it("should apply box shadow with color", () => {
    const { container } = render(<TetrisBlock color="#ff00ff" />);
    const block = container.firstChild;
    
    expect(block.style.boxShadow).toBeTruthy();
    expect(block.style.boxShadow).toContain("#ff00ff");
  });
});
