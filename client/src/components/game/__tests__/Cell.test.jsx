/**
 * Cell Component Tests
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Cell from "../Cell";

describe("Cell Component", () => {
  it("should render empty cell when no color provided", () => {
    const { container } = render(<Cell />);
    const emptyCell = container.querySelector(".bg-black\\/20");
    
    expect(emptyCell).toBeTruthy();
  });

  it("should render empty cell when color is null", () => {
    const { container } = render(<Cell color={null} />);
    const emptyCell = container.querySelector(".bg-black\\/20");
    
    expect(emptyCell).toBeTruthy();
  });

  it("should render colored cell when color is provided", () => {
    const { container } = render(<Cell color="#00f0f0" />);
    const emptyCell = container.querySelector(".bg-black\\/20");
    
    expect(emptyCell).toBeFalsy();
  });

  it("should apply color to styled divs", () => {
    const testColor = "#ff0000";
    const { container } = render(<Cell color={testColor} />);
    
    const styledDiv = container.querySelector('[style*="linear-gradient"]');
    expect(styledDiv).toBeTruthy();
  });

  it("should render multiple layers for depth effect", () => {
    const { container } = render(<Cell color="#00ff00" />);
    
    // Should have multiple divs for layering effect
    const divs = container.querySelectorAll("div");
    expect(divs.length).toBeGreaterThan(3);
  });
});
