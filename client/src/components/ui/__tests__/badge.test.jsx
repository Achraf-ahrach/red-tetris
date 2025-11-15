/**
 * Badge Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("should render badge with text", () => {
    render(<Badge data-testid="badge">Test Badge</Badge>);
    expect(screen.getByTestId("badge")).toBeDefined();
    expect(screen.getByText("Test Badge")).toBeDefined();
  });

  it("should apply default variant", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-primary");
  });

  it("should apply secondary variant", () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-secondary");
  });

  it("should apply destructive variant", () => {
    const { container } = render(<Badge variant="destructive">Destructive</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-destructive");
  });

  it("should apply outline variant", () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass("text-foreground");
  });

  it("should accept custom className", () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass("custom-class");
  });

  it("should pass through additional props", () => {
    render(<Badge data-testid="test-badge">Props</Badge>);
    expect(screen.getByTestId("test-badge")).toBeInTheDocument();
  });
});
