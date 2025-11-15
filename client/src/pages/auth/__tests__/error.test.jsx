/**
 * Auth Error Page Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AuthError from "../error";

describe("AuthError", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render error page", () => {
    const { container } = render(
      <BrowserRouter>
        <AuthError />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it("should display error message", () => {
    render(
      <BrowserRouter>
        <AuthError />
      </BrowserRouter>
    );
    expect(screen.getByText(/authentication/i)).toBeDefined();
  });
});
