/**
 * Landing Page Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "../index";

// Mock child components
vi.mock("@/components/landing/HeroSection", () => ({
  HeroSection: () => <div>Hero Section</div>,
}));

vi.mock("@/components/landing/ClassicGame", () => ({
  ClassicGame: () => <div>Classic Game</div>,
}));

vi.mock("@/components/landing/MultiplayerMode", () => ({
  MultiplayerMode: () => <div>Multiplayer Mode</div>,
}));

vi.mock("@/components/landing/Leaderboard", () => ({
  Leaderboard: () => <div>Leaderboard</div>,
}));

vi.mock("@/components/landing/Cta", () => ({
  CTA: () => <div>CTA</div>,
}));

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

vi.mock("@/components/ui/page-transition", () => ({
  PageTransition: ({ children }) => <div>{children}</div>,
}));

describe.skip("LandingPage", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render landing page", () => {
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it("should render all sections", () => {
    const { getByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    expect(getByText("Hero Section")).toBeDefined();
    expect(getByText("Classic Game")).toBeDefined();
    expect(getByText("Multiplayer Mode")).toBeDefined();
    expect(getByText("Leaderboard")).toBeDefined();
    expect(getByText("CTA")).toBeDefined();
  });
});
