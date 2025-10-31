import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Zap,
} from "lucide-react";
import BoardGlass from "@/components/game/BoardGlass";
import OpponentBoard from "@/components/game/OpponentBoard";
import { BOARD_WIDTH } from "@/types";
import {
  createEmptyBoard,
  getRandomTetromino,
  rotatePiece as rotateMatrix,
  isValidMove,
  placePiece,
  findCompletedLines,
  clearLines,
  calculateScore,
  isGameOver as checkGameOver,
  getDropSpeed,
} from "@/utils/gameLogic";

// Mode configuration (UI + simple UX rules)
const MODES = {
  classic: {
    label: "Classic",
    allowPause: true,
    accent: "from-rose-500 to-pink-500",
  },
  survival: {
    label: "Survival",
    allowPause: false,
    accent: "from-orange-500 to-red-500",
  },
  ranked: {
    label: "Ranked",
    allowPause: false,
    accent: "from-amber-400 to-yellow-500",
  },
  multiplayer: {
    label: "Multiplayer",
    allowPause: false,
    accent: "from-purple-500 to-fuchsia-500",
  },
};

// Tetris pieces (for ambient background only)
const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: "#00f0ff" },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffff00",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#aa00ff",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00ff00",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#ff0000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#0000ff",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#ff8800",
  },
};

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const modeKey = (searchParams.get("mode") || "classic").toLowerCase();
  const mode = useMemo(() => MODES[modeKey] || MODES.classic, [modeKey]);

  // Core game state
  const [gameState, setGameState] = useState("idle"); 
  const [board, setBoard] = useState(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0,
  });
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
    
  const boardWrapRef = useRef(null);

  // Mock opponent data for multiplayer (replace with real data from socket/API)
  const mockOpponents = useMemo(() => {
    if (modeKey !== "multiplayer") return [];
    // 1v1 only - single opponent
    return [
      {
        id: 1,
        name: "Player 2",
        board: createEmptyBoard(),
        score: 1250,
        lines: 8,
        isActive: true,
      },
    ];
  }, [modeKey]);

  // Initialize / restart
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
    setGameState("playing");

    // Bring board into view
    setTimeout(() => {
      boardWrapRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  }, []);

  const movePiece = useCallback(
    (dx, dy) => {
      if (gameState !== "playing" || !currentPiece) return false;
      const newPos = { x: currentPosition.x + dx, y: currentPosition.y + dy };
      if (isValidMove(board, currentPiece.shape, newPos)) {
        setCurrentPosition(newPos);
        return true;
      }
      return false;
    },
    [board, currentPiece, currentPosition, gameState]
  );

  const rotatePiece = useCallback(() => {
    if (gameState !== "playing" || !currentPiece) return;
    const rotated = rotateMatrix(currentPiece.shape);
    if (isValidMove(board, rotated, currentPosition)) {
      setCurrentPiece((p) => ({ ...p, shape: rotated }));
    }
  }, [board, currentPiece, currentPosition, gameState]);

  const hardDrop = useCallback(() => {
    if (gameState !== "playing" || !currentPiece) return;
    let newY = currentPosition.y;
    while (
      isValidMove(board, currentPiece.shape, {
        ...currentPosition,
        y: newY + 1,
      })
    ) {
      newY++;
    }
    setCurrentPosition((pos) => ({ ...pos, y: newY }));
    setScore((s) => s + 2 * Math.max(0, newY - currentPosition.y));
  }, [board, currentPiece, currentPosition, gameState]);

  const lockPiece = useCallback(() => {
    if (!currentPiece) return;
    const newBoard = placePiece(
      board,
      currentPiece.shape,
      currentPosition,
      currentPiece.color
    );
    const completed = findCompletedLines(newBoard);

    let finalBoard = newBoard;
    if (completed.length > 0) {
      finalBoard = clearLines(newBoard, completed);
      const newLines = lines + completed.length;
      const newLevel = Math.floor(newLines / 10) + 1;
      const gained = calculateScore(completed.length, level);
      setLines(newLines);
      setLevel(newLevel);
      setScore((s) => s + gained);
    }

    setBoard(finalBoard);

    if (checkGameOver(finalBoard)) {
      setGameState("over");
      return;
    }

    // Next piece
    const next = nextPiece || getRandomTetromino();
    const nextNext = getRandomTetromino();
    setCurrentPiece(next);
    setNextPiece(nextNext);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  }, [board, currentPiece, currentPosition, nextPiece, lines, level]);

  // Auto drop loop
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      const moved = movePiece(0, 1);
      if (!moved) lockPiece();
    }, getDropSpeed(level));
    return () => clearInterval(interval);
  }, [gameState, movePiece, lockPiece, level]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (gameState === "idle") return;
      if (gameState === "paused" || gameState === "over") {
        if ((e.key === " " || e.key === "Enter") && gameState !== "over")
          e.preventDefault();
        if (e.key.toLowerCase() === "p" && mode.allowPause)
          setGameState("playing");
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          movePiece(1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (movePiece(0, 1)) setScore((s) => s + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          rotatePiece();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "p":
        case "P":
          if (mode.allowPause) setGameState("paused");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState, movePiece, rotatePiece, hardDrop, mode]);

  // Actions
  const startGame = () => initializeGame();
  const pauseGame = () => {
    if (mode.allowPause)
      setGameState((s) => (s === "paused" ? "playing" : "paused"));
  };
  const resetGame = () => {
    setGameState("idle");
    setScore(0);
    setLevel(1);
    setLines(0);
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setNextPiece(null);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 mx-auto max-w-[1800px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid lg:grid-cols-[320px_1fr_320px] gap-4 py-3">
            {/* Left Panel - Stats */}
            <div className="space-y-4">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Game Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Score</span>
                      <span className="text-2xl font-bold text-primary">
                        {score.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Level</span>
                      <Badge
                        variant="default"
                        className="bg-secondary/20 text-secondary border-secondary/50"
                      >
                        {level}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Lines</span>
                      <span className="text-xl font-semibold text-accent">
                        {lines}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Next Piece</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 flex items-center justify-center min-h-[100px]">
                    {/* Overlay grid lines for look */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                        backgroundSize: `calc(100%/4) calc(100%/4)`,
                        backgroundPosition: "top left",
                      }}
                    />
                    <div className="relative">
                      {nextPiece ? (
                        (() => {
                          const shape = nextPiece.shape;
                          const rows = shape.length;
                          const cols = shape[0]?.length || 0;
                          let minRow = rows,
                            maxRow = -1,
                            minCol = cols,
                            maxCol = -1;
                          for (let r = 0; r < rows; r++) {
                            for (let c = 0; c < cols; c++) {
                              if (shape[r][c]) {
                                minRow = Math.min(minRow, r);
                                maxRow = Math.max(maxRow, r);
                                minCol = Math.min(minCol, c);
                                maxCol = Math.max(maxCol, c);
                              }
                            }
                          }
                          const w = maxCol - minCol + 1;
                          const h = maxRow - minRow + 1;
                          return (
                            <div
                              className="grid gap-1"
                              style={{
                                gridTemplateColumns: `repeat(${w}, 1fr)`,
                                transform: "scale(1.2)",
                              }}
                            >
                              {Array(h)
                                .fill(null)
                                .map((_, rr) =>
                                  Array(w)
                                    .fill(null)
                                    .map((_, cc) => {
                                      const ar = minRow + rr;
                                      const ac = minCol + cc;
                                      const active = shape[ar]?.[ac];
                                      return (
                                        <div
                                          key={`${rr}-${cc}`}
                                          className={`w-5 h-5 rounded-sm ${
                                            active
                                              ? "bg-white/70"
                                              : "bg-transparent"
                                          }`}
                                        />
                                      );
                                    })
                                )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="grid grid-cols-4 gap-1">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-sm border border-white/10"
                              style={{
                                backgroundColor:
                                  i < 4 ? "#00f0ff" : "transparent",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Panel - Game Board */}
            <div className="space-y-4" ref={boardWrapRef}>
              {/* Game Board - centered with proper height */}
              <div className="" style={{ minHeight: "70vh" }}>
                <BoardGlass
                  currentBoard={board}
                  currentPiece={currentPiece}
                  currentPosition={currentPosition}
                  isGameOver={gameState === "over"}
                />
              </div>

              {/* Game Controls */}
              <div className="space-y-1 flex-shrink-0">
                {gameState === "idle" && (
                  <Button onClick={startGame} className="w-full" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                )}

                {(gameState === "playing" || gameState === "paused") && (
                  <div className="grid grid-cols-2 gap-2">
                    {mode.allowPause ? (
                      <Button onClick={pauseGame} variant="outline" size="lg">
                        {gameState === "paused" ? (
                          <Play className="w-5 h-5 mr-2" />
                        ) : (
                          <Pause className="w-5 h-5 mr-2" />
                        )}
                        {gameState === "paused" ? "Resume" : "Pause"}
                      </Button>
                    ) : (
                      <div className="col-span-1 flex items-center justify-center text-xs text-muted-foreground">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                          Pause Disabled
                        </span>
                      </div>
                    )}
                    <Button onClick={resetGame} variant="outline" size="lg">
                      <RotateCw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                )}

                {gameState === "over" && (
                  <div className="space-y-3">
                    <div className="text-center py-4">
                      <p className="text-2xl font-bold text-red-400 mb-2">
                        Game Over!
                      </p>
                      <p className="text-muted-foreground">
                        Final Score: {score.toLocaleString()}
                      </p>
                    </div>
                    <Button onClick={startGame} className="w-full" size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      Play Again
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Opponent (Multiplayer) or Controls */}
            <div className="space-y-4">
              {/* Show opponent board in multiplayer mode (1v1) */}
              {modeKey === "multiplayer" && mockOpponents.length > 0 ? (
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      Opponent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OpponentBoard
                      opponentBoard={mockOpponents[0].board}
                      opponentName={mockOpponents[0].name}
                      opponentScore={mockOpponents[0].score}
                      opponentLines={mockOpponents[0].lines}
                      isActive={mockOpponents[0].isActive}
                    />
                  </CardContent>
                </Card>
              ) : null}

              {/* Controls Card */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <ArrowLeft className="w-5 h-5 text-primary" />
                      <span className="text-sm">Move Left</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <ArrowRight className="w-5 h-5 text-primary" />
                      <span className="text-sm">Move Right</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <ArrowDown className="w-5 h-5 text-primary" />
                      <span className="text-sm">Soft Drop</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <Zap className="w-5 h-5 text-secondary" />
                      <span className="text-sm">Hard Drop (Space)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
