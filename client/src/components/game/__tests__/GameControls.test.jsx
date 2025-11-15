/**
 * GameControls Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import GameControls from "../GameControls";

describe("GameControls", () => {
  const mockHandlers = {
    onStart: vi.fn(),
    onPause: vi.fn(),
    onRestart: vi.fn(),
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render game controls", () => {
    const { container } = render(
      <GameControls isGameOver={false} isPaused={false} {...mockHandlers} />
    );
    expect(container.querySelector(".flex")).toBeDefined();
  });

  it("should show new game button when game is over", () => {
    render(
      <GameControls isGameOver={true} isPaused={false} {...mockHandlers} />
    );
    expect(screen.getByText(/new game/i)).toBeDefined();
  });

  it("should show pause button during active game", () => {
    render(
      <GameControls isGameOver={false} isPaused={false} {...mockHandlers} />
    );
    const pauseButton = screen
      .getAllByText(/pause/i)
      .find((el) => el.tagName === "SPAN" && el.textContent === "Pause");
    expect(pauseButton).toBeDefined();
  });

  it("should show resume button when game is paused", () => {
    render(
      <GameControls isGameOver={false} isPaused={true} {...mockHandlers} />
    );
    const resumeButton = screen
      .getAllByText(/resume/i)
      .find((el) => el.tagName === "SPAN");
    expect(resumeButton).toBeDefined();
  });

  it("should show restart button during active game", () => {
    render(
      <GameControls isGameOver={false} isPaused={false} {...mockHandlers} />
    );
    const restartButton = screen
      .getAllByText(/restart/i)
      .find((el) => el.tagName === "SPAN");
    expect(restartButton).toBeDefined();
  });

  it("should call onRestart when new game clicked", () => {
    render(
      <GameControls isGameOver={true} isPaused={false} {...mockHandlers} />
    );
    const newGameBtn = screen
      .getAllByText(/new game/i)
      .find((el) => el.tagName === "SPAN");
    fireEvent.click(newGameBtn.parentElement);
    expect(mockHandlers.onRestart).toHaveBeenCalled();
  });

  it("should call onPause when pause clicked", () => {
    render(
      <GameControls isGameOver={false} isPaused={false} {...mockHandlers} />
    );
    const pauseBtn = screen
      .getAllByText(/pause/i)
      .find((el) => el.tagName === "SPAN" && el.textContent === "Pause");
    fireEvent.click(pauseBtn.parentElement);
    expect(mockHandlers.onPause).toHaveBeenCalled();
  });

  it("should call onRestart when restart clicked during game", () => {
    render(
      <GameControls isGameOver={false} isPaused={false} {...mockHandlers} />
    );
    const restartBtn = screen
      .getAllByText(/restart/i)
      .find((el) => el.tagName === "SPAN");
    fireEvent.click(restartBtn.parentElement);
    expect(mockHandlers.onRestart).toHaveBeenCalled();
  });
});
