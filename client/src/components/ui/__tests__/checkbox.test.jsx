/**
 * Checkbox Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { Checkbox } from "../checkbox";

describe("Checkbox", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render checkbox", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector("button");
    expect(checkbox).toBeDefined();
  });

  it("should handle checked state", () => {
    const { container } = render(<Checkbox checked />);
    const checkbox = container.querySelector("button");
    expect(checkbox.getAttribute("data-state")).toBe("checked");
  });

  it("should handle unchecked state", () => {
    const { container } = render(<Checkbox checked={false} />);
    const checkbox = container.querySelector("button");
    expect(checkbox.getAttribute("data-state")).toBe("unchecked");
  });

  it("should call onCheckedChange when clicked", () => {
    const handleChange = vi.fn();
    const { container } = render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = container.querySelector("button");
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    const { container } = render(<Checkbox disabled />);
    const checkbox = container.querySelector("button");
    expect(checkbox.disabled).toBe(true);
  });

  it("should apply custom className", () => {
    const { container } = render(<Checkbox className="custom-class" />);
    const checkbox = container.querySelector("button");
    expect(checkbox.className).toContain("custom-class");
  });
});
