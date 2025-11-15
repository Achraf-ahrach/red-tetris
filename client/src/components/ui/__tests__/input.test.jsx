/**
 * Input Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { Input } from "../input";

describe("Input", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render input", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input).toBeDefined();
  });

  it("should accept value prop", () => {
    const { container } = render(<Input value="test value" readOnly />);
    const input = container.querySelector("input");
    expect(input.value).toBe("test value");
  });

  it("should handle onChange", () => {
    const handleChange = vi.fn();
    const { container } = render(<Input onChange={handleChange} />);

    const input = container.querySelector("input");
    fireEvent.change(input, { target: { value: "new value" } });

    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector("input");
    expect(input.className).toContain("custom-class");
  });

  it("should be disabled when disabled prop is true", () => {
    const { container } = render(<Input disabled />);
    const input = container.querySelector("input");
    expect(input.disabled).toBe(true);
  });

  it("should accept placeholder", () => {
    const { container } = render(<Input placeholder="Enter text" />);
    const input = container.querySelector("input");
    expect(input.placeholder).toBe("Enter text");
  });

  it("should accept type prop", () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector("input");
    expect(input.type).toBe("password");
  });
});
