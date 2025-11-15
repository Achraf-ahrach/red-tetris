/**
 * Progress Component Tests
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Progress } from "../progress";

describe("Progress Component", () => {
  it("should render progress bar", () => {
    const { container } = render(<Progress value={50} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeTruthy();
  });

  it("should show 50% progress", () => {
    const { container } = render(<Progress value={50} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute("aria-valuenow")).toBe("50");
  });

  it("should show 0% progress by default", () => {
    const { container } = render(<Progress />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("should show 100% progress", () => {
    const { container } = render(<Progress value={100} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute("aria-valuenow")).toBe("100");
  });

  it("should clamp value above max", () => {
    const { container } = render(<Progress value={150} max={100} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute("aria-valuenow")).toBe("100");
  });

  it("should clamp negative value to 0", () => {
    const { container } = render(<Progress value={-10} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("should handle custom max value", () => {
    const { container } = render(<Progress value={50} max={200} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute("aria-valuenow")).toBe("25");
  });

  it("should have correct aria attributes", () => {
    const { container } = render(<Progress value={75} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("100");
    expect(progressBar.getAttribute("aria-valuenow")).toBe("75");
  });

  it("should apply custom className", () => {
    const { container } = render(<Progress value={50} className="custom-progress" />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.className).toContain("custom-progress");
  });

  it("should have base styling classes", () => {
    const { container } = render(<Progress value={50} />);
    
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar.className).toContain("rounded-full");
    expect(progressBar.className).toContain("bg-muted");
  });

  it("should render inner progress indicator", () => {
    const { container } = render(<Progress value={60} />);
    
    const indicator = container.querySelector('.bg-primary');
    expect(indicator).toBeTruthy();
  });

  it("should calculate correct transform for 25%", () => {
    const { container } = render(<Progress value={25} />);
    
    const indicator = container.querySelector('.bg-primary');
    expect(indicator.style.transform).toBe("translateX(-75%)");
  });

  it("should calculate correct transform for 80%", () => {
    const { container } = render(<Progress value={80} />);
    
    const indicator = container.querySelector('.bg-primary');
    expect(indicator.style.transform).toBe("translateX(-20%)");
  });
});
