import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  Trophy,
  Users,
  Play,
  ArrowRight,
  ArrowDown,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import socketService from "@/services/socketService";
import { getPieceFromType } from "@/utils/tetrominoShapes";
import BoardGlass from "@/components/game/BoardGlass";
import OpponentBoard from "@/components/game/OpponentBoard";
import { BOARD_WIDTH } from "@/types";
import {
  createEmptyBoard,
  rotatePiece as rotateMatrix,
  isValidMove,
  placePiece,
  findCompletedLines,
  clearLines,
  calculateScore,
  isGameOver as checkGameOver,
  getDropSpeed,
  addGarbageLines,
} from "@/utils/gameLogic";

/**
 * Multiplayer Game Room - Play page with full Tetris game logic
 */
export default function MultiplayerGameRoom() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId");

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState("waiting");
  const [countdown, setCountdown] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [winner, setWinner] = useState(null); // Track who won

  // Piece sequence (shared between players)
  const [pieceSequence, setPieceSequence] = useState([]);
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);

  // My game state - use function initializer to ensure fresh board
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0,
  });
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);

  // Opponent state - completely independent board
  const [opponentBoard, setOpponentBoard] = useState(() => createEmptyBoard());
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentLines, setOpponentLines] = useState(0);

  // Garbage queue system (like real Tetris games)
  const [incomingGarbageQueue, setIncomingGarbageQueue] = useState(0);
  const garbageQueueRef = useRef(0); // Track garbage queue

  // Visual feedback for garbage sent/received
  const [recentGarbageReceived, setRecentGarbageReceived] = useState(0);
  const [recentGarbageSent, setRecentGarbageSent] = useState(0);

  const boardWrapRef = useRef(null);

  // Refs to hold current state values for event handlers (avoid stale closures)
  const gameStateRef = useRef(gameState);
  const currentPieceRef = useRef(currentPiece);
  const currentPositionRef = useRef(currentPosition);
  const isReceivingGarbageRef = useRef(false); // Flag to prevent update loops

  // Track processed garbage events to prevent duplicates
  const processedGarbageEvents = useRef(new Set());

  // Track my base board (without garbage) vs opponent's base board
  // Initialize with fresh empty boards
  const myBaseBoard = useRef(createEmptyBoard());
  const opponentBaseBoard = useRef(createEmptyBoard());

  // Update refs when state changes - ALWAYS use deep copies
  useEffect(() => {
    gameStateRef.current = gameState;
    currentPieceRef.current = currentPiece;
    currentPositionRef.current = currentPosition;
    // Deep copy to prevent reference sharing
    myBaseBoard.current = board.map((row) => [...row]);
    garbageQueueRef.current = incomingGarbageQueue;
  }, [gameState, currentPiece, currentPosition, board, incomingGarbageQueue]);

  // Calculate garbage to send based on lines cleared (n - 1 indestructible lines)
  const calculateGarbageToSend = useCallback((linesCleared) => {
    return Math.max(0, (linesCleared || 0) - 1);
  }, []);

  // Game logic functions
  const getNextPieceFromSequence = useCallback(() => {
    if (!pieceSequence || currentPieceIndex >= pieceSequence.length - 1) {
      return null;
    }
    const nextIndex = currentPieceIndex + 1;
    const nextPieceType = pieceSequence[nextIndex];
    const nextPiece = getPieceFromType(nextPieceType);
    return nextPiece;
  }, [pieceSequence, currentPieceIndex]);

  const advanceToPieceIndex = useCallback(
    (index) => {
      if (!pieceSequence || index >= pieceSequence.length) {
        return null;
      }
      const pieceType = pieceSequence[index];
      const piece = getPieceFromType(pieceType);
      setCurrentPieceIndex(index);
      return piece;
    },
    [pieceSequence]
  );

  const movePiece = useCallback(
    (dx, dy) => {
      if (gameState !== "playing" || !currentPiece) return false;
      const currentBoardState = myBaseBoard.current;
      const newPos = { x: currentPosition.x + dx, y: currentPosition.y + dy };
      if (isValidMove(currentBoardState, currentPiece.shape, newPos)) {
        setCurrentPosition(newPos);
        return true;
      }
      return false;
    },
    [currentPiece, currentPosition, gameState]
  );

  const rotatePiece = useCallback(() => {
    if (gameState !== "playing" || !currentPiece) return;
    const currentBoardState = myBaseBoard.current;
    const rotated = rotateMatrix(currentPiece.shape);
    if (isValidMove(currentBoardState, rotated, currentPosition)) {
      setCurrentPiece((p) => ({ ...p, shape: rotated }));
    }
  }, [currentPiece, currentPosition, gameState]);

  const hardDrop = useCallback(() => {
    if (gameState !== "playing" || !currentPiece) return;
    const currentBoardState = myBaseBoard.current;
    let newY = currentPosition.y;
    while (
      isValidMove(currentBoardState, currentPiece.shape, {
        ...currentPosition,
        y: newY + 1,
      })
    ) {
      newY++;
    }
    setCurrentPosition((pos) => ({ ...pos, y: newY }));
    setScore((s) => s + 2 * Math.max(0, newY - currentPosition.y));
  }, [currentPiece, currentPosition, gameState]);

  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    const currentBoardState = myBaseBoard.current;

    const newBoard = placePiece(
      currentBoardState,
      currentPiece.shape,
      currentPosition,
      currentPiece.color
    );
    const completed = findCompletedLines(newBoard);

    let finalBoard = newBoard;
    let newScore = score;
    let newLines = lines;
    let newLevel = level;

    // Handle line clears and garbage cancellation
    if (completed.length > 0) {
      finalBoard = clearLines(newBoard, completed);
      newLines = lines + completed.length;
      newLevel = Math.floor(newLines / 10) + 1;
      const gained = calculateScore(completed.length, level);
      newScore = score + gained;
      setLines(newLines);
      setLevel(newLevel);
      setScore(newScore);

      // Calculate garbage to send (SIMPLE VERSION - No cancellation)
      const garbageToSend = calculateGarbageToSend(completed.length);

      if (garbageToSend > 0) {
        if (roomId && gameState === "playing") {
          const result = socketService._emit("send-garbage", {
            roomId,
            garbageLines: garbageToSend,
            linesCleared: completed.length,
          });

          // Show visual feedback
          if (result) {
            setRecentGarbageSent(garbageToSend);
            setTimeout(() => setRecentGarbageSent(0), 2000);
          }
        } else {
        }
      } else {
      }
    }

    // Create a deep copy of the final board before setting state
    const finalBoardCopy = finalBoard.map((row) => [...row]);

    setBoard(finalBoardCopy);
    myBaseBoard.current = finalBoardCopy;

    // Send update to opponent
    if (roomId) {
      // Verify the board is valid before sending
      if (!Array.isArray(finalBoardCopy) || finalBoardCopy.length !== 20) {
        return;
      }

      // Create a separate deep copy for network transmission
      const boardToSend = finalBoardCopy.map((row) => [...row]);

      socketService._emit("game-update", {
        roomId,
        gameState: {
          board: boardToSend,
          score: newScore,
          lines: newLines,
          level: newLevel,
        },
      });
    }

    if (checkGameOver(finalBoard)) {
      setGameState("finished");
      // Notify server of game over
      socketService._emit("game-over", {
        roomId,
        finalScore: newScore,
        stats: { lines: newLines, level: newLevel },
      });
      return;
    }

    // Get next piece from sequence
    const nextIndex = currentPieceIndex + 1;
    const nextPiece = advanceToPieceIndex(nextIndex);
    if (nextPiece) {
      setCurrentPiece(nextPiece);
      const nextNextPiece = getNextPieceFromSequence();
      setNextPiece(nextNextPiece);
      setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }
  }, [
    currentPiece,
    currentPosition,
    currentPieceIndex,
    score,
    lines,
    level,
    roomId,
    gameState,
    advanceToPieceIndex,
    getNextPieceFromSequence,
    calculateGarbageToSend,
  ]);

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
      if (gameState !== "playing") return;

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
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState, movePiece, rotatePiece, hardDrop]);

  // Connect and listen for events
  useEffect(() => {
    if (!roomId) {
      navigate("/game/multiplayer");
      return;
    }

    const connectSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
      } catch (error) {}
    };

    connectSocket();
  }, [roomId, navigate]);

  // Game event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Player joined room
    const handlePlayerJoined = ({ player }) => {
      if (player.username !== user.username) {
        setOpponent(player);
      }
    };

    // Match found (game starting)
    const handleMatchFound = ({ opponent, pieceSequence }) => {
      setOpponent(opponent);
      setPieceSequence(pieceSequence);
      setGameState("waiting");
    };

    // Game starting countdown
    const handleGameStarting = ({ countdown }) => {
      setGameState("starting");
      setCountdown(countdown);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Game actually starts
    const handleGameStart = () => {
      setGameState("playing");
      setCountdown(null);

      // Initialize game with first two pieces from sequence
      if (pieceSequence.length > 1) {
        const firstPiece = getPieceFromType(pieceSequence[0]);
        const secondPiece = getPieceFromType(pieceSequence[1]);
        setCurrentPiece(firstPiece);
        setNextPiece(secondPiece);
        setCurrentPieceIndex(0);
        setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });

        // Scroll board into view
        setTimeout(() => {
          boardWrapRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    };

    // Opponent update - NEVER update my own board from opponent data
    const handleOpponentUpdate = ({ board, score, lines, level }) => {
      // CRITICAL CHECK: Ensure we received valid board data
      if (!board || !Array.isArray(board) || board.length !== 20) {
        return;
      }

      // Create a COMPLETE DEEP COPY to prevent any reference sharing
      const opponentBoardCopy = board.map((row) => {
        if (!Array.isArray(row)) {
          return Array(BOARD_WIDTH).fill(0);
        }
        return [...row];
      });

      // Update opponent board state with the deep copy
      setOpponentBoard(opponentBoardCopy);
      opponentBaseBoard.current = opponentBoardCopy;

      setOpponentScore(score || 0);
      setOpponentLines(lines || 0);
    };

    // Receive garbage lines from opponent
    const handleReceiveGarbage = ({
      garbageLines,
      fromPlayer,
      linesCleared,
      eventId,
    }) => {
      // Generate eventId if not provided for backwards compatibility
      const garbageEventId =
        eventId || `${fromPlayer}-${Date.now()}-${garbageLines}`;

      // Check if we've already processed this exact garbage event
      if (processedGarbageEvents.current.has(garbageEventId)) {
        return;
      }

      if (garbageLines > 0 && gameStateRef.current === "playing") {
        // Mark this event as processed
        processedGarbageEvents.current.add(garbageEventId);

        // Clean up old events (keep only last 50)
        if (processedGarbageEvents.current.size > 50) {
          const arr = Array.from(processedGarbageEvents.current);
          processedGarbageEvents.current = new Set(arr.slice(-50));
        }

        setBoard((currentBoard) => {
          // Create a deep copy of current board first
          const currentBoardCopy = currentBoard.map((row) => [...row]);

          // Add garbage lines (full-width indestructible)
          const boardWithGarbage = addGarbageLines(
            currentBoardCopy,
            garbageLines
          );

          // Create another deep copy for state to ensure complete independence
          const finalBoard = boardWithGarbage.map((row) => [...row]);

          myBaseBoard.current = finalBoard;
          return finalBoard;
        });

        // Adjust piece position up
        setCurrentPosition((pos) => ({
          x: pos.x,
          y: Math.max(0, pos.y - garbageLines),
        }));

        // Show visual feedback
        setRecentGarbageReceived(garbageLines);
        setTimeout(() => setRecentGarbageReceived(0), 2000);
      }
    };

    // Opponent left
    const handleOpponentLeft = () => {
      alert("Opponent left the game!");
      navigate("/game/multiplayer");
    };

    // Opponent disconnected
    const handleOpponentDisconnected = () => {
      alert("Opponent disconnected!");
      navigate("/game/multiplayer");
    };

    // Game end
    const handleGameEnd = ({ winner: winnerData }) => {
      setGameState("finished");
      setWinner(winnerData);
    };

    socketService._on("player-joined", handlePlayerJoined);
    socketService._on("match-found", handleMatchFound);
    socketService._on("game-starting", handleGameStarting);
    socketService._on("game-start", handleGameStart);
    socketService._on("opponent-update", handleOpponentUpdate);
    socketService._on("receive-garbage", handleReceiveGarbage);
    socketService._on("opponent-left", handleOpponentLeft);
    socketService._on("opponent-disconnected", handleOpponentDisconnected);
    socketService._on("game-end", handleGameEnd);

    return () => {
      socketService._off("player-joined", handlePlayerJoined);
      socketService._off("match-found", handleMatchFound);
      socketService._off("game-starting", handleGameStarting);
      socketService._off("game-start", handleGameStart);
      socketService._off("opponent-update", handleOpponentUpdate);
      socketService._off("receive-garbage", handleReceiveGarbage);
      socketService._off("opponent-left", handleOpponentLeft);
      socketService._off("opponent-disconnected", handleOpponentDisconnected);
      socketService._off("game-end", handleGameEnd);
    };
  }, [isConnected, user, navigate, pieceSequence]);

  const leaveRoom = () => {
    if (roomId) {
      socketService._emit("leave-room", { roomId });
    }
    navigate("/game/multiplayer");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 mx-auto max-w-[1800px]">
        {/* Countdown Overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-9xl font-bold text-white"
            >
              {countdown}
            </motion.div>
          </div>
        )}

        {/* Waiting for Opponent */}
        {gameState === "waiting" && (
          <div className="flex items-center justify-center min-h-screen">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Waiting for Opponent...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The game will start automatically when another player joins.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <Button variant="outline" onClick={leaveRoom}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lobby
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Board - Classic Mode Layout */}
        {(gameState === "playing" ||
          gameState === "starting" ||
          gameState === "finished") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid lg:grid-cols-[320px_1fr_320px] gap-4 py-3">
              {/* Left Panel - My Stats */}
              <div className="space-y-4">
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Your Stats</CardTitle>
                      <Badge
                        variant={isConnected ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {isConnected ? (
                          <>
                            <Wifi className="w-3 h-3 mr-1" /> Online
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3 mr-1" /> Offline
                          </>
                        )}
                      </Badge>
                    </div>
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

                {/* Next Piece Preview (Classic Style) */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Next Piece</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 flex items-center justify-center min-h-[100px]">
                      {/* Overlay grid lines */}
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
                          <div className="text-muted-foreground text-sm">-</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center Panel - Game Board with BoardGlass */}
              <div className="space-y-4" ref={boardWrapRef}>
                {/* Game Board - centered with proper height */}
                <div style={{ minHeight: "70vh" }}>
                  <BoardGlass
                    key={`my-board-${user?.id || "player"}`}
                    currentBoard={board}
                    currentPiece={currentPiece}
                    currentPosition={currentPosition}
                    isGameOver={gameState === "finished"}
                  />
                </div>

                {/* Game Controls */}
                <div className="space-y-1 flex-shrink-0">
                  <Button
                    onClick={leaveRoom}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Lobby
                  </Button>
                </div>
              </div>

              {/* Right Panel - Opponent */}
              <div className="space-y-4">
                {/* Opponent Board */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      Opponent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OpponentBoard
                      key={`opponent-board-${
                        opponent?.id || opponent?.username || "opponent"
                      }`}
                      opponentBoard={opponentBoard}
                      opponentName={opponent?.username || "Opponent"}
                      opponentScore={opponentScore}
                      opponentLines={opponentLines}
                      isActive={gameState === "playing"}
                    />
                  </CardContent>
                </Card>

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

                    {/* Game Info */}
                    <div className="pt-3 mt-3 border-t border-white/10 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pieces:</span>
                        <span className="font-semibold">
                          {currentPieceIndex + 1} / {pieceSequence.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {roomId?.slice(-8)}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Over Overlay */}
        {gameState === "finished" && winner && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    {winner.username === user.username ? (
                      <span className="text-green-500">🎉 Victory!</span>
                    ) : (
                      <span className="text-red-500">Defeat</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Winner/Loser Message */}
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    {winner.username === user.username ? (
                      <div>
                        <div className="text-xl font-bold text-green-400 mb-1">
                          You Won!
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {opponent?.username} lost the game
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xl font-bold text-red-400 mb-1">
                          You Lost
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {winner.username} won the game!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Your Stats */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Your Score
                    </div>
                    <div className="text-4xl font-bold mb-2">
                      {score.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-semibold">{lines}</div>
                      <div className="text-sm text-muted-foreground">Lines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold">{level}</div>
                      <div className="text-sm text-muted-foreground">Level</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate("/game/multiplayer")}
                    className="w-full"
                  >
                    Return to Lobby
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
