import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Board from "@/components/game/Board";
import GameStats from "@/components/game/GameStats";
import GameControls from "@/components/game/GameControls";
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
} from "@/pages/game/gameLogic";

function Game() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen text-white flex flex-col items-center justify-center p-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <span className="text-lg">←</span>
          <span>Back to Home</span>
        </button>

        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4">
            RED TETRIS
          </h1>
          {!gameStarted && !isGameOver && (
            <p className="text-xl mb-4 text-gray-300">
              Press Space or Enter to start!
            </p>
          )}
        </div>

        <div className="flex gap-8 items-start flex-wrap justify-center">
          <Board
            currentBoard={board}
            currentPiece={currentPiece}
            currentPosition={currentPosition}
            isGameOver={isGameOver}
          />
          <div className="flex flex-col gap-4">
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center border border-white/20 shadow-2xl">
              <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                PAUSED
              </h2>
              <p className="text-gray-300">Press P to resume</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
