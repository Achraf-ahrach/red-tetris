/**
 * Avatar Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";

describe("Avatar Components", () => {
  describe("Avatar", () => {
    it("should render avatar", () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<Avatar className="custom" />);
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("AvatarImage", () => {
    it("should render avatar image", () => {
      render(<AvatarImage src="/test.jpg" alt="Test" />);
      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "/test.jpg");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <AvatarImage src="/test.jpg" className="custom" />
      );
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("AvatarFallback", () => {
    it("should render avatar fallback", () => {
      render(<AvatarFallback>AB</AvatarFallback>);
      expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<AvatarFallback className="custom">AB</AvatarFallback>);
      expect(container.firstChild).toHaveClass("custom");
    });
  });

  describe("Complete Avatar", () => {
    it("should render complete avatar with image and fallback", () => {
      render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="User" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.getByText("UN")).toBeInTheDocument();
    });
  });
});
