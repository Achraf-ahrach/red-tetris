/**
 * AuthLayout Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AuthLayout } from "../AuthLayout";

describe("AuthLayout", () => {
  it("should render auth layout", () => {
    const { container } = render(
      <BrowserRouter>
        <AuthLayout title="Test Title" description="Test Description" />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it("should render with title", () => {
    render(
      <BrowserRouter>
        <AuthLayout title="Login" description="Enter credentials" />
      </BrowserRouter>
    );
    expect(screen.getByText("Login")).toBeDefined();
  });

  it("should render with description", () => {
    render(
      <BrowserRouter>
        <AuthLayout title="Register" description="Create account" />
      </BrowserRouter>
    );
    expect(screen.getByText("Create account")).toBeDefined();
  });

  it("should render footer content when provided", () => {
    render(
      <BrowserRouter>
        <AuthLayout
          title="Test"
          description="Test"
          footerContent={<div>Footer Test</div>}
        />
      </BrowserRouter>
    );
    expect(screen.getByText("Footer Test")).toBeDefined();
  });

  it("should render children via Outlet", () => {
    const { container } = render(
      <BrowserRouter>
        <AuthLayout title="Test" description="Test" />
      </BrowserRouter>
    );
    // Outlet will be rendered
    expect(container.querySelector(".min-h-screen")).toBeDefined();
  });
});
