import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Board from "@/components/game/Board";
import GameStats from "@/components/game/GameStats";
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

function MultiplayerGame({ roomName, playerName }) {
  const navigate = useNavigate();
  console.log("Room Name:", roomName);
  console.log("Player Name:", playerName);

  // const isHost = "false";

  // Player 1 (local player) state
  const [p1Board, setP1Board] = useState(createEmptyBoard);
  const [p1CurrentPiece, setP1CurrentPiece] = useState(null);
  const [p1CurrentPosition, setP1CurrentPosition] = useState({ x: 0, y: 0 });
  const [p1NextPiece, setP1NextPiece] = useState(null);
  const [p1Score, setP1Score] = useState(0);
  const [p1Level, setP1Level] = useState(1);
  const [p1Lines, setP1Lines] = useState(0);
  const [p1GameOver, setP1GameOver] = useState(false);

  // Player 2 (opponent) state - simulated for demo
  const [p2Board, setP2Board] = useState(createEmptyBoard);
  const [p2CurrentPiece, setP2CurrentPiece] = useState(null);
  const [p2CurrentPosition, setP2CurrentPosition] = useState({ x: 0, y: 0 });
  const [p2NextPiece, setP2NextPiece] = useState(null);
  const [p2Score, setP2Score] = useState(0);
  const [p2Level, setP2Level] = useState(1);
  const [p2Lines, setP2Lines] = useState(0);
  const [p2GameOver, setP2GameOver] = useState(false);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [opponent, setOpponent] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);

  // Simulate opponent joining (for demo purposes)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (isHost) {
  //       setOpponent({ name: "Player2", connected: true });
  //     } else {
  //       setOpponent({ name: "Host", connected: true });
  //     }
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [isHost]);

  // Initialize game for both players
  const initializeGame = useCallback(() => {
    const newBoard1 = createEmptyBoard();
    const newBoard2 = createEmptyBoard();
    const firstPiece1 = getRandomTetromino();
    const secondPiece1 = getRandomTetromino();
    const firstPiece2 = getRandomTetromino();
    const secondPiece2 = getRandomTetromino();

    // Player 1
    setP1Board(newBoard1);
    setP1CurrentPiece(firstPiece1);
    setP1NextPiece(secondPiece1);
    setP1CurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setP1Score(0);
    setP1Level(1);
    setP1Lines(0);
    setP1GameOver(false);

    // Player 2 (simulated)
    setP2Board(newBoard2);
    setP2CurrentPiece(firstPiece2);
    setP2NextPiece(secondPiece2);
    setP2CurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setP2Score(0);
    setP2Level(1);
    setP2Lines(0);
    setP2GameOver(false);

    setIsPaused(false);
    setGameStarted(true);
    setGameWinner(null);
  }, []);

  // Player 1 movement
  const moveP1Piece = useCallback(
    (deltaX, deltaY) => {
      if (p1GameOver || isPaused || !p1CurrentPiece || gameWinner) return false;

      const newPosition = {
        x: p1CurrentPosition.x + deltaX,
        y: p1CurrentPosition.y + deltaY,
      };

      if (isValidMove(p1Board, p1CurrentPiece.shape, newPosition)) {
        setP1CurrentPosition(newPosition);
        return true;
      }
      return false;
    },
    [
      p1Board,
      p1CurrentPiece,
      p1CurrentPosition,
      p1GameOver,
      isPaused,
      gameWinner,
    ]
  );

  // Player 1 rotation
  const rotateP1Piece = useCallback(() => {
    if (p1GameOver || isPaused || !p1CurrentPiece || gameWinner) return;

    const rotatedShape = rotatePiece(p1CurrentPiece.shape);

    if (isValidMove(p1Board, rotatedShape, p1CurrentPosition)) {
      setP1CurrentPiece((prev) => ({ ...prev, shape: rotatedShape }));
    }
  }, [
    p1Board,
    p1CurrentPiece,
    p1CurrentPosition,
    p1GameOver,
    isPaused,
    gameWinner,
  ]);

  // Player 1 hard drop
  const hardDropP1 = useCallback(() => {
    if (p1GameOver || isPaused || !p1CurrentPiece || gameWinner) return;

    let dropDistance = 0;
    let newY = p1CurrentPosition.y;

    while (
      isValidMove(p1Board, p1CurrentPiece.shape, {
        ...p1CurrentPosition,
        y: newY + 1,
      })
    ) {
      newY++;
      dropDistance++;
    }

    setP1CurrentPosition((prev) => ({ ...prev, y: newY }));
    setP1Score((prev) => prev + dropDistance * 2);
  }, [
    p1Board,
    p1CurrentPiece,
    p1CurrentPosition,
    p1GameOver,
    isPaused,
    gameWinner,
  ]);

  // Lock piece for Player 1
  const lockP1Piece = useCallback(() => {
    if (!p1CurrentPiece) return;

    const newBoard = placePiece(
      p1Board,
      p1CurrentPiece.shape,
      p1CurrentPosition,
      p1CurrentPiece.color
    );
    const completedLines = findCompletedLines(newBoard);

    let finalBoard = newBoard;
    if (completedLines.length > 0) {
      finalBoard = clearLines(newBoard, completedLines);
      const newLines = p1Lines + completedLines.length;
      const newLevel = Math.floor(newLines / 10) + 1;
      const lineScore = calculateScore(completedLines.length, p1Level);

      setP1Lines(newLines);
      setP1Level(newLevel);
      setP1Score((prev) => prev + lineScore);
    }

    setP1Board(finalBoard);

    // Check game over
    if (checkGameOver(finalBoard)) {
      setP1GameOver(true);
      setGameWinner(opponent ? opponent.name : "Player 2");
      return;
    }

    // Get next piece
    const newPiece = p1NextPiece;
    const nextNewPiece = getRandomTetromino();

    setP1CurrentPiece(newPiece);
    setP1NextPiece(nextNewPiece);
    setP1CurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  }, [
    p1Board,
    p1CurrentPiece,
    p1CurrentPosition,
    p1NextPiece,
    p1Lines,
    p1Level,
    opponent,
  ]);

  // Simulate Player 2 (opponent) gameplay
  const simulateP2Move = useCallback(() => {
    if (!p2CurrentPiece || p2GameOver || gameWinner) return;

    // Simple AI: move randomly or drop
    const actions = ["left", "right", "down", "rotate", "drop"];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    let moved = false;
    const newPosition = { ...p2CurrentPosition };

    switch (randomAction) {
      case "left":
        newPosition.x -= 1;
        if (isValidMove(p2Board, p2CurrentPiece.shape, newPosition)) {
          setP2CurrentPosition(newPosition);
          moved = true;
        }
        break;
      case "right":
        newPosition.x += 1;
        if (isValidMove(p2Board, p2CurrentPiece.shape, newPosition)) {
          setP2CurrentPosition(newPosition);
          moved = true;
        }
        break;
      case "down":
        newPosition.y += 1;
        if (isValidMove(p2Board, p2CurrentPiece.shape, newPosition)) {
          setP2CurrentPosition(newPosition);
          moved = true;
        }
        break;
      case "rotate":
        const rotatedShape = rotatePiece(p2CurrentPiece.shape);
        if (isValidMove(p2Board, rotatedShape, p2CurrentPosition)) {
          setP2CurrentPiece((prev) => ({ ...prev, shape: rotatedShape }));
          moved = true;
        }
        break;
      case "drop":
        // Auto drop handled by game loop
        break;
    }

    // Auto drop
    if (!moved && Math.random() > 0.3) {
      newPosition.y += 1;
      if (isValidMove(p2Board, p2CurrentPiece.shape, newPosition)) {
        setP2CurrentPosition(newPosition);
      } else {
        // Lock piece
        const newBoard = placePiece(
          p2Board,
          p2CurrentPiece.shape,
          p2CurrentPosition,
          p2CurrentPiece.color
        );
        const completedLines = findCompletedLines(newBoard);

        let finalBoard = newBoard;
        if (completedLines.length > 0) {
          finalBoard = clearLines(newBoard, completedLines);
          const newLines = p2Lines + completedLines.length;
          const newLevel = Math.floor(newLines / 10) + 1;
          const lineScore = calculateScore(completedLines.length, p2Level);

          setP2Lines(newLines);
          setP2Level(newLevel);
          setP2Score((prev) => prev + lineScore);
        }

        setP2Board(finalBoard);

        // Check game over
        if (checkGameOver(finalBoard)) {
          setP2GameOver(true);
          setGameWinner(playerName);
          return;
        }

        // Get next piece
        const newPiece = p2NextPiece;
        const nextNewPiece = getRandomTetromino();

        setP2CurrentPiece(newPiece);
        setP2NextPiece(nextNewPiece);
        setP2CurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
      }
    }
  }, [
    p2Board,
    p2CurrentPiece,
    p2CurrentPosition,
    p2NextPiece,
    p2Lines,
    p2Level,
    p2GameOver,
    gameWinner,
    playerName,
  ]);

  // Game loops
  useEffect(() => {
    if (!gameStarted || p1GameOver || isPaused || gameWinner) return;

    const interval = setInterval(() => {
      const moved = moveP1Piece(0, 1);
      if (!moved) {
        lockP1Piece();
      }
    }, getDropSpeed(p1Level));

    return () => clearInterval(interval);
  }, [
    gameStarted,
    p1GameOver,
    isPaused,
    moveP1Piece,
    lockP1Piece,
    p1Level,
    gameWinner,
  ]);

  // Player 2 simulation loop
  useEffect(() => {
    if (!gameStarted || p2GameOver || isPaused || !opponent || gameWinner)
      return;

    const interval = setInterval(() => {
      simulateP2Move();
    }, getDropSpeed(p2Level) * 0.8); // Slightly faster for variation

    return () => clearInterval(interval);
  }, [
    gameStarted,
    p2GameOver,
    isPaused,
    simulateP2Move,
    p2Level,
    opponent,
    gameWinner,
  ]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!gameStarted) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          moveP1Piece(-1, 0);
          break;
        case "ArrowRight":
          event.preventDefault();
          moveP1Piece(1, 0);
          break;
        case "ArrowDown":
          event.preventDefault();
          const moved = moveP1Piece(0, 1);
          if (moved) setP1Score((prev) => prev + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          rotateP1Piece();
          break;
        case " ":
          event.preventDefault();
          hardDropP1();
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
  }, [gameStarted, moveP1Piece, rotateP1Piece, hardDropP1]);

  const handleRestart = () => {
    initializeGame();
  };

  const handleLeaveRoom = () => {
    navigate("/multiplayer");
  };

  if (!roomName || !playerName) {
    navigate("/multiplayer");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen text-white p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleLeaveRoom}
            className="group flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-red-500/30 transition-all duration-300 border border-red-500/30"
          >
            <span className="text-lg">←</span>
            <span>Leave Room</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              MULTIPLAYER BATTLE
            </h1>
            <p className="text-gray-300 mt-1">
              Room: <span className="font-bold">{roomName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {gameStarted && !gameWinner && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 bg-yellow-500/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-yellow-500/30 transition-all duration-300 border border-yellow-500/30"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
        </div>

        {/* Waiting for opponent */}
        {!opponent && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center border border-white/20 shadow-2xl">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">
                Waiting for Opponent...
              </h2>
              <p className="text-gray-300">
                Share room code:{" "}
                <span className="font-bold text-blue-400">{roomName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Game Area */}
        {opponent && (
          <>
            {/* Start Game Button */}
            {!gameStarted && !gameWinner && (
              <div className="text-center mb-8">
                <button
                  onClick={initializeGame}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  START BATTLE!
                </button>
              </div>
            )}

            {/* Game Winner */}
            {gameWinner && (
              <div className="text-center mb-6">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-2xl inline-block">
                  <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {gameWinner === playerName ? "🏆 YOU WIN!" : "💔 YOU LOSE!"}
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Winner: <span className="font-bold">{gameWinner}</span>
                  </p>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Players and Boards */}
            <div className="flex gap-8 items-start justify-center flex-wrap">
              {/* Player 1 (You) */}
              <div className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-bold text-blue-400 mb-1">
                    👤 {playerName}
                  </h3>
                  <p className="text-sm text-gray-400">YOU</p>
                </div>
                <div className="flex gap-4">
                  <Board
                    currentBoard={p1Board}
                    currentPiece={p1CurrentPiece}
                    currentPosition={p1CurrentPosition}
                    isGameOver={p1GameOver}
                  />
                  <GameStats
                    score={p1Score}
                    level={p1Level}
                    lines={p1Lines}
                    nextPiece={p1NextPiece}
                  />
                </div>
              </div>

              {/* VS Indicator */}
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 animate-pulse">
                  VS
                </div>
              </div>

              {/* Player 2 (Opponent) */}
              <div className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-bold text-red-400 mb-1">
                    🤖 {opponent.name}
                  </h3>
                  <p className="text-sm text-gray-400">OPPONENT</p>
                </div>
                <div className="flex gap-4">
                  <Board
                    currentBoard={p2Board}
                    currentPiece={p2CurrentPiece}
                    currentPosition={p2CurrentPosition}
                    isGameOver={p2GameOver}
                  />
                  <GameStats
                    score={p2Score}
                    level={p2Level}
                    lines={p2Lines}
                    nextPiece={p2NextPiece}
                  />
                </div>
              </div>
            </div>

            {/* Controls Info */}
            {gameStarted && !gameWinner && (
              <div className="mt-8 text-center">
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 inline-block">
                  <p className="text-sm text-gray-300">
                    <strong>Controls:</strong> Arrow Keys to move • Space for
                    hard drop • P to pause
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pause Overlay */}
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

export default MultiplayerGame;
