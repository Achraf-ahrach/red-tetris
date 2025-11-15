/**
 * Label Component Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { Label } from "../label";

describe("Label", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render label", () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText("Test Label")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(<Label className="custom">Label Text</Label>);
    const label = container.querySelector("label");
    expect(label.className).toContain("custom");
  });

  it("should accept htmlFor prop", () => {
    const { container } = render(
      <Label htmlFor="test-input">Email Label</Label>
    );
    const label = container.querySelector("label");
    expect(label.htmlFor).toBe("test-input");
  });

  it("should render with associated input", () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </div>
    );

    expect(screen.getByText("Email")).toBeDefined();
    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toBeDefined();
    expect(emailInput.type).toBe("email");
  });
});
