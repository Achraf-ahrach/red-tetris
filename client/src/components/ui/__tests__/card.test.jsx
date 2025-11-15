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
      const { container } = render(<Card className="custom">Content</Card>);
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("CardHeader", () => {
    it("should render card header", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<CardHeader className="custom">Header</CardHeader>);
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("CardTitle", () => {
    it("should render card title", () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<CardTitle className="custom">Title</CardTitle>);
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("CardDescription", () => {
    it("should render card description", () => {
      render(<CardDescription>Description</CardDescription>);
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CardDescription className="custom">Desc</CardDescription>
      );
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("CardContent", () => {
    it("should render card content", () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<CardContent className="custom">Content</CardContent>);
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("CardFooter", () => {
    it("should render card footer", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<CardFooter className="custom">Footer</CardFooter>);
      expect(container.firstChild).toHaveClass("custom");
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

      expect(screen.getByTestId("full-card")).toBeInTheDocument();
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(screen.getByText("Test Footer")).toBeInTheDocument();
    });
  });
});
