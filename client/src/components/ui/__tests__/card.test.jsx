/**
 * Card Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../card";

describe("Card Components", () => {
  describe("Card", () => {
    it("should render card", () => {
      render(<Card data-testid="card">Card Content</Card>);
      expect(screen.getByTestId("card")).toBeDefined();
    });

    it("should apply custom className", () => {
      const { container } = render(<Card className="custom" />);
      const card = container.querySelector("div");
      expect(card.className).toContain("custom");
    });
  });

  describe("CardHeader", () => {
    it("should render card header", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId("header")).toBeDefined();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CardHeader className="custom">Header</CardHeader>
      );
      const header = container.querySelector("div");
      expect(header.className).toContain("custom");
    });
  });

  describe("CardTitle", () => {
    it("should render card title", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      expect(screen.getByTestId("title")).toBeDefined();
      expect(screen.getByText("Title")).toBeDefined();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CardTitle className="custom">Title</CardTitle>
      );
      const title = container.querySelector("div");
      expect(title.className).toContain("custom");
    });
  });

  describe("CardDescription", () => {
    it("should render card description", () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>);
      expect(screen.getByTestId("desc")).toBeDefined();
      expect(screen.getByText("Description")).toBeDefined();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CardDescription className="custom">Desc</CardDescription>
      );
      const desc = container.querySelector("div");
      expect(desc.className).toContain("custom");
    });
  });

  describe("CardContent", () => {
    it("should render card content", () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId("content")).toBeDefined();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CardContent className="custom">Content</CardContent>
      );
      const content = container.querySelector("div");
      expect(content.className).toContain("custom");
    });
  });

  describe("CardFooter", () => {
    it("should render card footer", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId("footer")).toBeDefined();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CardFooter className="custom">Footer</CardFooter>
      );
      const footer = container.querySelector("div");
      expect(footer.className).toContain("custom");
    });
  });

  describe("Full Card", () => {
    it("should render complete card with all components", () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByTestId("full-card")).toBeDefined();
      expect(screen.getByText("Test Title")).toBeDefined();
      expect(screen.getByText("Test Description")).toBeDefined();
      expect(screen.getByText("Test Content")).toBeDefined();
      expect(screen.getByText("Test Footer")).toBeDefined();
    });
  });
});
