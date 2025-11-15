/**
 * NotFound Page Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import NotFoundPage from "../NotFound";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("NotFoundPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("should render 404 page", () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("should have go back button", () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    const goBackButton = screen.getByText("Go Back");
    expect(goBackButton).toBeInTheDocument();
  });

  it("should have go home button", () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    const goHomeButton = screen.getByText("Go Home");
    expect(goHomeButton).toBeInTheDocument();
  });

  it("should navigate back when go back is clicked", () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    const goBackButton = screen.getByText("Go Back");
    fireEvent.click(goBackButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("should navigate to home when go home is clicked", () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    const goHomeButton = screen.getByText("Go Home");
    fireEvent.click(goHomeButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should display help text", () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Need help/i)).toBeInTheDocument();
  });
});
