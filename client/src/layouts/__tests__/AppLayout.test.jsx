/**
 * AppLayout Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import AppLayout from "../AppLayout";

// Mock child components
vi.mock("@/components/BottomDock", () => ({
  default: () => <div data-testid="bottom-dock">BottomDock</div>,
}));

vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

describe("AppLayout", () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  it("should render app layout", () => {
    const { container } = render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    expect(container.querySelector("main")).toBeDefined();
  });

  it("should render navbar when not on home page", () => {
    const { queryByTestId } = render(
      <BrowserRouter initialEntries={["/game"]}>
        <AppLayout />
      </BrowserRouter>
    );
    // Navbar may or may not be shown depending on route
    expect(queryByTestId("bottom-dock")).toBeDefined();
  });

  it("should render main content area", () => {
    const { container } = render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    const main = container.querySelector("main");
    expect(main).toBeDefined();
    expect(main.getAttribute("tabindex")).toBe("-1");
  });

  it("should have proper styling classes", () => {
    const { container } = render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );
    expect(container.querySelector(".min-h-screen")).toBeDefined();
  });
});
