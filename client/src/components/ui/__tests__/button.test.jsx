/**
 * Button Component Tests
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button, buttonVariants } from "../button";

describe("Button Component", () => {
  it("should render button element by default", () => {
    const { container } = render(<Button>Click me</Button>);
    
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
    expect(button.textContent).toBe("Click me");
  });

  it("should apply default variant classes", () => {
    const { container } = render(<Button>Default</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("bg-primary");
  });

  it("should apply destructive variant", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("bg-destructive");
  });

  it("should apply outline variant", () => {
    const { container} = render(<Button variant="outline">Outline</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("border");
  });

  it("should apply secondary variant", () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("bg-secondary");
  });

  it("should apply ghost variant", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("hover:bg-accent");
  });

  it("should apply link variant", () => {
    const { container } = render(<Button variant="link">Link</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("underline");
  });

  it("should apply small size", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("h-8");
  });

  it("should apply large size", () => {
    const { container } = render(<Button size="lg">Large</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("h-10");
  });

  it("should apply icon size", () => {
    const { container } = render(<Button size="icon">+</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("h-9");
    expect(button.className).toContain("w-9");
  });

  it("should accept custom className", () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("custom-class");
  });

  it("should pass through additional props", () => {
    const { container } = render(<Button type="submit" disabled>Submit</Button>);
    
    const button = container.querySelector("button");
    expect(button.type).toBe("submit");
    expect(button.disabled).toBe(true);
  });

  it("should have cursor-pointer class", () => {
    const { container } = render(<Button>Pointer</Button>);
    
    const button = container.querySelector("button");
    expect(button.className).toContain("cursor-pointer");
  });
});

describe("buttonVariants", () => {
  it("should generate default variant classes", () => {
    const className = buttonVariants();
    
    expect(className).toContain("inline-flex");
    expect(className).toContain("items-center");
  });

  it("should generate variant-specific classes", () => {
    const destructiveClass = buttonVariants({ variant: "destructive" });
    
    expect(destructiveClass).toContain("bg-destructive");
  });

  it("should generate size-specific classes", () => {
    const largeClass = buttonVariants({ size: "lg" });
    
    expect(largeClass).toContain("h-10");
  });
});
