import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useSearchParams,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
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
  Crown,
  Share2,
  Copy,
  Check,
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
 * URL Format: /<roomName>/<playerName>
 */
export default function MultiplayerGameRoom() {
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract from URL: /<roomName>/<playerName>
  const roomNameFromUrl = params.roomName;
  const playerNameFromUrl = params.playerName;
  const roomIdFromState = location.state?.roomId;
  const roomIdFromQuery = searchParams.get("roomId");

  // Use player name from authenticated user (prioritize over URL for security)
  // If URL has a different name, show warning but still use authenticated username
  const playerName =
    user?.username ||
    (playerNameFromUrl ? decodeURIComponent(playerNameFromUrl) : "Guest");

  // Warn if URL player name doesn't match authenticated user
  useEffect(() => {
    if (
      user &&
      playerNameFromUrl &&
      decodeURIComponent(playerNameFromUrl) !== user.username
    ) {
      console.warn(
        `URL player name "${decodeURIComponent(
          playerNameFromUrl
        )}" doesn't match authenticated user "${
          user.username
        }". Using authenticated username.`
      );
    }
  }, [user, playerNameFromUrl]);

  // Room ID state
  const [roomId, setRoomId] = useState(roomIdFromState || roomIdFromQuery);
  const [roomName, setRoomName] = useState(
    roomNameFromUrl ? decodeURIComponent(roomNameFromUrl) : ""
  );
  const [isHost, setIsHost] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [urlCopied, setUrlCopied] = useState(false);
  const [opponentLeftMessage, setOpponentLeftMessage] = useState(null);

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
    // Redirect if no room info available
    if (!roomId && !roomNameFromUrl) {
      navigate("/game/multiplayer");
      return;
    }

    const connectSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
      } catch (error) {
        console.error("Connection failed:", error);
        alert("Failed to connect to server");
        navigate("/game/multiplayer");
      }
    };

    connectSocket();
  }, [roomId, roomNameFromUrl, navigate]);

  // Game event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Room found (when joining by name)
    const handleRoomFound = ({
      roomId: foundRoomId,
      roomName: foundRoomName,
    }) => {
      console.log("Room found:", foundRoomId, foundRoomName);
      setRoomId(foundRoomId);
      setRoomName(foundRoomName);
    };

    // Room not found
    const handleRoomNotFound = ({ roomName: notFoundRoomName }) => {
      alert(
        `Room "${notFoundRoomName}" not found or has ended.\n\nRedirecting to lobby...`
      );
      navigate("/game/multiplayer");
    };

    // Room joined successfully
    const handleRoomJoined = ({
      roomId: joinedRoomId,
      isHost: hostStatus,
      room,
    }) => {
      console.log("Room joined:", room, "isHost:", hostStatus);
      setRoomId(joinedRoomId);
      setRoomName(room.roomName);
      setIsHost(hostStatus);
      setPieceSequence(room.pieceSequence);
      setPlayerCount(room.players.length);

      // Find opponent
      const otherPlayers = room.players.filter(
        (p) => p.username !== playerName
      );
      if (otherPlayers.length > 0) {
        setOpponent(otherPlayers[0]);
      }
    };

    // Host transferred
    const handleHostTransferred = ({ isHost: newIsHost }) => {
      setIsHost(newIsHost);
    };

    // Player joined room
    const handlePlayerJoined = ({ player, playerCount: count }) => {
      setPlayerCount(count);
      if (player.username !== playerName) {
        setOpponent(player);
      }
    };

    // Player left room
    const handlePlayerLeft = ({ playerCount: count }) => {
      setPlayerCount(count);
      if (count === 1) {
        setOpponent(null);
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
    const handleOpponentLeft = ({ player }) => {
      const opponentName = player?.username || "Opponent";

      // Only handle if in lobby (waiting state)
      // If game is active, server will send game-end event instead
      if (gameState === "waiting") {
        setOpponent(null);
        setOpponentBoard(createEmptyBoard());
        setOpponentScore(0);
        setOpponentLines(0);

        // Show notification in lobby
        setOpponentLeftMessage(`${opponentName} has left the room.`);
        setTimeout(() => setOpponentLeftMessage(null), 5000);
      }
    };

    // Opponent disconnected
    const handleOpponentDisconnected = ({ player }) => {
      const opponentName = player?.username || "Opponent";

      // Only handle if in lobby (waiting state)
      // If game is active, server will send game-end event instead
      if (gameState === "waiting") {
        setOpponent(null);
        setOpponentBoard(createEmptyBoard());
        setOpponentScore(0);
        setOpponentLines(0);

        // Show notification in lobby
        setOpponentLeftMessage(`${opponentName} has disconnected.`);
        setTimeout(() => setOpponentLeftMessage(null), 5000);
      }
    };

    // Game end
    const handleGameEnd = ({ winner: winnerData, loser }) => {
      setGameState("finished");

      // Clear opponent state
      setOpponent(null);
      setOpponentBoard(createEmptyBoard());
      setOpponentScore(0);
      setOpponentLines(0);

      // Set winner with reason if loser left/disconnected
      if (loser?.reason) {
        setWinner({
          ...winnerData,
          reason: `${loser.username || "Opponent"} ${loser.reason}`,
        });
      } else {
        setWinner(winnerData);
      }
    };

    socketService._on("room-found", handleRoomFound);
    socketService._on("room-not-found", handleRoomNotFound);
    socketService._on("room-joined", handleRoomJoined);
    socketService._on("host-transferred", handleHostTransferred);
    socketService._on("player-joined", handlePlayerJoined);
    socketService._on("player-left", handlePlayerLeft);
    socketService._on("match-found", handleMatchFound);
    socketService._on("game-starting", handleGameStarting);
    socketService._on("game-start", handleGameStart);
    socketService._on("opponent-update", handleOpponentUpdate);
    socketService._on("receive-garbage", handleReceiveGarbage);
    socketService._on("opponent-left", handleOpponentLeft);
    socketService._on("opponent-disconnected", handleOpponentDisconnected);
    socketService._on("game-end", handleGameEnd);

    return () => {
      socketService._off("room-found", handleRoomFound);
      socketService._off("room-not-found", handleRoomNotFound);
      socketService._off("room-joined", handleRoomJoined);
      socketService._off("host-transferred", handleHostTransferred);
      socketService._off("player-joined", handlePlayerJoined);
      socketService._off("player-left", handlePlayerLeft);
      socketService._off("match-found", handleMatchFound);
      socketService._off("game-starting", handleGameStarting);
      socketService._off("game-start", handleGameStart);
      socketService._off("opponent-update", handleOpponentUpdate);
      socketService._off("receive-garbage", handleReceiveGarbage);
      socketService._off("opponent-left", handleOpponentLeft);
      socketService._off("opponent-disconnected", handleOpponentDisconnected);
      socketService._off("game-end", handleGameEnd);
    };
  }, [isConnected, playerName, navigate, pieceSequence]);

  // Join room after connected
  useEffect(() => {
    if (!isConnected) return;

    // If we have roomId, join directly
    if (roomId) {
      console.log("Joining room:", roomId, "as", playerName);
      socketService._emit("join-room", {
        roomId,
        userId: user?.id || `guest-${Date.now()}`,
        username: playerName,
      });
      return;
    }

    // If we have room name from URL, find it first
    if (roomNameFromUrl) {
      console.log("Looking up room:", roomName);
      socketService._emit("get-room-by-name", { roomName });
    }
  }, [isConnected, roomId, roomNameFromUrl, roomName, playerName, user]);

  const leaveRoom = () => {
    if (roomId) {
      socketService._emit("leave-room", { roomId });
    }
    navigate("/game/multiplayer");
  };

  const handleHostStartGame = () => {
    if (isHost && roomId) {
      socketService._emit("host-start-game", { roomId });
    }
  };

  const copyShareUrl = async () => {
    if (!roomName || !playerName) return;

    // Generate shareable URL with actual player name
    const shareUrl = `${window.location.origin}/${encodeURIComponent(
      roomName
    )}/${encodeURIComponent(playerName)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      // Fallback: show alert with URL
      alert(`Share this URL:\n\n${shareUrl}`);
    }
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

        {/* Waiting for Opponent or Host to Start */}
        {gameState === "waiting" && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md mx-auto space-y-4">
              {/* Opponent Left/Disconnected Notification */}
              {opponentLeftMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                >
                  <p className="text-sm font-medium">{opponentLeftMessage}</p>
                </motion.div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isHost && <Crown className="w-5 h-5 text-yellow-500" />}
                    <Users className="w-5 h-5" />
                    {roomName || "Game Room"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Players</span>
                      <Badge variant="secondary">{playerCount} / 2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Your Name</span>
                      <span className="font-semibold">{playerName}</span>
                    </div>
                    {opponent && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Opponent</span>
                        <span className="font-semibold">
                          {opponent.username}
                        </span>
                      </div>
                    )}
                    {isHost && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                        <Crown className="w-4 h-4" />
                        You are the host
                      </div>
                    )}
                  </div>

                  {isHost ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-sm">
                        {playerCount < 2
                          ? "Waiting for another player to join..."
                          : "Both players ready! Click Start Game to begin."}
                      </p>
                      <Button
                        onClick={handleHostStartGame}
                        className="w-full"
                        disabled={playerCount < 2}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {playerCount < 2
                          ? "Waiting for Players..."
                          : "Start Game"}
                      </Button>
                      {playerCount < 2 && (
                        <Button
                          onClick={copyShareUrl}
                          variant="outline"
                          className="w-full"
                        >
                          {urlCopied ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              URL Copied!
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Invite URL
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        Waiting for host to start the game...
                      </p>
                      <Button
                        onClick={copyShareUrl}
                        variant="outline"
                        className="w-full"
                      >
                        {urlCopied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            URL Copied!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Invite URL
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4 pt-2">
                    {!isHost && (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    )}
                    <Button variant="outline" onClick={leaveRoom}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Leave Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    {winner.username === playerName ? (
                      <span className="text-green-500">🎉 Victory!</span>
                    ) : (
                      <span className="text-red-500">Defeat</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Winner/Loser Message */}
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    {winner.username === playerName ? (
                      <div>
                        <div className="text-xl font-bold text-green-400 mb-1">
                          You Won!
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {winner.reason ||
                            (opponent?.username
                              ? `${opponent.username} lost the game`
                              : "Opponent lost the game")}
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

        {/* Opponent Left Notification */}
        {opponentLeftMessage && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-sm font-semibold rounded-lg py-2 px-4 shadow-lg z-50">
            {opponentLeftMessage}
          </div>
        )}
      </div>
    </div>
  );
}
