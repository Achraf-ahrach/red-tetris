/**
 * Input Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Input } from "../input";

describe("Input", () => {
  it("should render input", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("should accept value prop", () => {
    render(<Input value="test value" readOnly />);
    expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
  });

  it("should handle onChange", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByTestId("input");
    fireEvent.change(input, { target: { value: "new value" } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const { container } = render(<Input className="custom-class" data-testid="input" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId("input")).toBeDisabled();
  });

  it("should accept placeholder", () => {
    render(<Input placeholder="Enter text" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("placeholder", "Enter text");
  });

  it("should accept type prop", () => {
    render(<Input type="password" data-testid="password-input" />);
    expect(screen.getByTestId("password-input")).toHaveAttribute("type", "password");
  });
});
