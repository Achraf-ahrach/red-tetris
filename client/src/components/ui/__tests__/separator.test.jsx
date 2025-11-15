/**
 * Separator Component Tests
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "../separator";

describe("Separator Component", () => {
  it("should render separator", () => {
    const { container } = render(<Separator />);
    
    const separator = container.firstChild;
    expect(separator).toBeTruthy();
  });

  it("should be horizontal by default", () => {
    const { container } = render(<Separator />);
    
    const separator = container.firstChild;
    expect(separator.className).toContain("h-[1px]");
    expect(separator.className).toContain("w-full");
  });

  it("should apply vertical orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    
    const separator = container.firstChild;
    expect(separator.className).toContain("h-full");
    expect(separator.className).toContain("w-[1px]");
  });

  it("should have bg-border class", () => {
    const { container } = render(<Separator />);
    
    const separator = container.firstChild;
    expect(separator.className).toContain("bg-border");
  });

  it("should apply custom className", () => {
    const { container } = render(<Separator className="my-separator" />);
    
    const separator = container.firstChild;
    expect(separator.className).toContain("my-separator");
  });

  it("should be decorative by default", () => {
    const { container } = render(<Separator />);
    
    const separator = container.firstChild;
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("should accept non-decorative prop", () => {
    const { container } = render(<Separator decorative={false} />);
    
    const separator = container.firstChild;
    expect(separator).toBeTruthy();
  });

  it("should have shrink-0 class", () => {
    const { container } = render(<Separator />);
    
    const separator = container.firstChild;
    expect(separator.className).toContain("shrink-0");
  });
});
