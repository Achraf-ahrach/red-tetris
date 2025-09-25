import React, { useState, useEffect, useCallback } from "react";
import Board from "@/components/Board";
import GameStats from "@/components/GameStats";
import GameControls from "@/components/GameControls";
import { BOARD_WIDTH } from "@/types";
import {
  createEmptyBoard,
  getRandomTetromino,
  rotatePiece,
  isValidMove,
  placePiece,
  findCompletedLines,
  clearLines,
  calculateScore,
  isGameOver as checkGameOver,
  getDropSpeed,
} from "@/utils/gameLogic";

function Game() {
  // Game state
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize game
  const initializeGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    const firstPiece = getRandomTetromino();
    const secondPiece = getRandomTetromino();

    setBoard(newBoard);
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setScore(0);
    setLevel(1);
    setLines(0);
    setIsGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
  }, []);

  // Move piece
  const movePiece = useCallback(
    (deltaX, deltaY) => {
      if (isGameOver || isPaused || !currentPiece) return false;

      const newPosition = {
        x: currentPosition.x + deltaX,
        y: currentPosition.y + deltaY,
      };

      if (isValidMove(board, currentPiece.shape, newPosition)) {
        setCurrentPosition(newPosition);
        return true;
      }
      return false;
    },
    [board, currentPiece, currentPosition, isGameOver, isPaused]
  );

  // Rotate piece
  const rotatePieceHandler = useCallback(() => {
    if (isGameOver || isPaused || !currentPiece) return;

    const rotatedShape = rotatePiece(currentPiece.shape);

    if (isValidMove(board, rotatedShape, currentPosition)) {
      setCurrentPiece((prev) => ({ ...prev, shape: rotatedShape }));
    }
  }, [board, currentPiece, currentPosition, isGameOver, isPaused]);

  // Drop piece to bottom
  const hardDrop = useCallback(() => {
    if (isGameOver || isPaused || !currentPiece) return;

    let dropDistance = 0;
    let newY = currentPosition.y;

    while (
      isValidMove(board, currentPiece.shape, {
        ...currentPosition,
        y: newY + 1,
      })
    ) {
      newY++;
      dropDistance++;
    }

    setCurrentPosition((prev) => ({ ...prev, y: newY }));
    setScore((prev) => prev + dropDistance * 2);
  }, [board, currentPiece, currentPosition, isGameOver, isPaused]);

  // Lock piece and get next piece
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = placePiece(
      board,
      currentPiece.shape,
      currentPosition,
      currentPiece.color
    );
    const completedLines = findCompletedLines(newBoard);

    let finalBoard = newBoard;
    if (completedLines.length > 0) {
      finalBoard = clearLines(newBoard, completedLines);
      const newLines = lines + completedLines.length;
      const newLevel = Math.floor(newLines / 10) + 1;
      const lineScore = calculateScore(completedLines.length, level);

      setLines(newLines);
      setLevel(newLevel);
      setScore((prev) => prev + lineScore);
    }

    setBoard(finalBoard);

    // Check game over
    if (checkGameOver(finalBoard)) {
      setIsGameOver(true);
      setGameStarted(false);
      return;
    }

    // Get next piece
    const newPiece = nextPiece;
    const nextNewPiece = getRandomTetromino();

    setCurrentPiece(newPiece);
    setNextPiece(nextNewPiece);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  }, [board, currentPiece, currentPosition, nextPiece, lines, level]);

  // Game loop - drop piece automatically
  useEffect(() => {
    if (!gameStarted || isGameOver || isPaused) return;

    const interval = setInterval(() => {
      const moved = movePiece(0, 1);
      if (!moved) {
        lockPiece();
      }
    }, getDropSpeed(level));

    return () => clearInterval(interval);
  }, [gameStarted, isGameOver, isPaused, movePiece, lockPiece, level]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!gameStarted) {
        if (event.key === " " || event.key === "Enter") {
          initializeGame();
        }
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          event.preventDefault();
          movePiece(1, 0);
          break;
        case "ArrowDown":
          event.preventDefault();
          const moved = movePiece(0, 1);
          if (moved) setScore((prev) => prev + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          rotatePieceHandler();
          break;
        case " ":
          event.preventDefault();
          hardDrop();
          break;
        case "p":
        case "P":
          setIsPaused((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, movePiece, rotatePieceHandler, hardDrop, initializeGame]);

  // Start game on mount
  useEffect(() => {
    if (!gameStarted) {
      initializeGame();
    }
  }, []);

  const handleRestart = () => {
    initializeGame();
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center p-4">
      {/* <h1 className="text-4xl font-bold mb-8 text-red-500">Red Tetris</h1> */}

      {!gameStarted && !isGameOver && (
        <div className="text-center mb-8">
          <p className="text-xl mb-4">Press Space or Enter to start!</p>
        </div>
      )}

      <div className="flex gap-8 items-start flex-wrap justify-center">
        <Board
          currentBoard={board}
          currentPiece={currentPiece}
          currentPosition={currentPosition}
          isGameOver={isGameOver}
        />
        <div className="flex flex-col gap-2">
          <GameStats
            score={score}
            level={level}
            lines={lines}
            nextPiece={nextPiece}
          />
          <GameControls
            isGameOver={isGameOver}
            isPaused={isPaused}
            onStart={initializeGame}
            onPause={handlePause}
            onRestart={handleRestart}
          />
        </div>
      </div>

      {isPaused && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">PAUSED</h2>
            <p>Press P to resume</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
