/**
 * Socket.IO Configuration and Event Handlers
 * Manages real-time 1v1 multiplayer game sessions with lobby system
 */

// Active game rooms: roomId -> { roomName, creator, players, gameState, ... }
const gameRooms = new Map();

// Tetromino types for piece generation
const TETROMINOS = ["I", "O", "T", "S", "Z", "J", "L"];

/**
 * Generate a sequence of random tetromino pieces
 * Both players will receive the same sequence
 * @param {number} count - Number of pieces to generate
 * @returns {Array<string>} Array of piece types
 */
function generatePieceSequence(count = 100) {
  const sequence = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
    sequence.push(TETROMINOS[randomIndex]);
  }
  return sequence;
}

/**
 * Start game in a room
 */
function startGame(io, roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.gameState.started) return;

  room.gameState.started = true;
  room.gameState.startTime = Date.now();

  // Notify players with their positions and piece sequence
  room.players.forEach((player, index) => {
    io.to(player.socketId).emit("match-found", {
      roomId,
      opponent: room.players[1 - index]?.userData || null,
      position: index,
      pieceSequence: room.gameState.pieceSequence,
    });
  });

  // Start countdown
  io.to(roomId).emit("game-starting", { countdown: 3 });

  setTimeout(() => {
    io.to(roomId).emit("game-start", {
      startTime: room.gameState.startTime,
    });
  }, 3000);

  // Update room list
  io.emit("room-list", getRoomList());
}

/**
 * Get list of available rooms for lobby
 */
function getRoomList() {
  return Array.from(gameRooms.values()).map((room) => ({
    roomId: room.roomId,
    roomName: room.roomName,
    creator: room.creator,
    players: room.players.map((p) => ({
      userId: p.userData?.id,
      username: p.userData?.username,
    })),
    maxPlayers: room.maxPlayers || 2,
    status: room.gameState.started ? "playing" : "waiting",
    createdAt: room.createdAt,
  }));
}

/**
 * Setup Socket.IO event handlers
 * @param {Server} io - Socket.IO server instance
 */
export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    // ==================== LOBBY SYSTEM ====================

    // Get list of available rooms
    socket.on("get-room-list", () => {
      const rooms = getRoomList();
      socket.emit("room-list", rooms);
    });

    // Create a new game room
    socket.on("create-room", ({ roomName, creatorId, creatorUsername }) => {
      const roomId = `room-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const pieceSequence = generatePieceSequence(100);

      const gameRoom = {
        roomId,
        roomName: roomName || `${creatorUsername}'s Room`,
        creator: { id: creatorId, username: creatorUsername },
        players: [],
        maxPlayers: 2,
        gameState: {
          started: false,
          startTime: null,
          pieceSequence: pieceSequence,
        },
        createdAt: new Date().toISOString(),
      };

      gameRooms.set(roomId, gameRoom);

      // Notify creator
      socket.emit("room-created", { roomId, roomName: gameRoom.roomName });

      // Broadcast updated room list to all clients
      io.emit("room-list", getRoomList());
    });

    // Join an existing room
    socket.on("join-room", ({ roomId, userId, username }) => {
      const room = gameRooms.get(roomId);

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit("error", { message: "Room is full" });
        return;
      }

      if (room.gameState.started) {
        socket.emit("error", { message: "Game already started" });
        return;
      }

      // Add player to room
      socket.join(roomId);
      socket.userData = { id: userId, username: username }; // Store userData on socket
      const playerData = {
        socketId: socket.id,
        userData: { id: userId, username: username },
      };
      room.players.push(playerData);

      // Notify player they joined
      socket.emit("room-joined", {
        roomId,
        room: {
          roomId: room.roomId,
          roomName: room.roomName,
          players: room.players.map((p) => p.userData),
          pieceSequence: room.gameState.pieceSequence,
        },
      });

      // Notify all players in room
      io.to(roomId).emit("player-joined", {
        player: { id: userId, username: username },
        playerCount: room.players.length,
      });

      // Broadcast updated room list
      io.emit("room-list", getRoomList());

      // Auto-start if room is full
      if (room.players.length === room.maxPlayers) {
        setTimeout(() => {
          startGame(io, roomId);
        }, 1000);
      }
    });

    // Start game (both players ready)
    socket.on("player-ready", ({ roomId }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      // Mark player as ready
      const player = room.players.find((p) => p.socketId === socket.id);
      if (player) {
        player.ready = true;
      }

      // Check if both players are ready
      const allReady = room.players.every((p) => p.ready);
      if (allReady && !room.gameState.started) {
        room.gameState.started = true;
        room.gameState.startTime = Date.now();

        // Start countdown and game
        io.to(roomId).emit("game-starting", {
          countdown: 3,
        });

        setTimeout(() => {
          io.to(roomId).emit("game-start", {
            startTime: room.gameState.startTime,
          });
        }, 3000);
      }
    });

    // Update game state (board, score, etc.)
    socket.on("game-update", ({ roomId, gameState }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      // Validate board data
      const board = gameState?.board;
      if (!board || !Array.isArray(board) || board.length !== 20) {
        return;
      }

      // Find opponent's socket ID
      const opponent = room.players.find((p) => p.socketId !== socket.id);
      if (!opponent) return;

      // Send directly to opponent's socket, not to room
      io.to(opponent.socketId).emit("opponent-update", {
        board: gameState.board,
        score: gameState.score,
        lines: gameState.lines,
        level: gameState.level,
        currentPiece: gameState.currentPiece,
      });
    }); // Send garbage lines to opponent
    socket.on("send-garbage", ({ roomId, garbageLines, linesCleared }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      if (!linesCleared && !garbageLines) return;

      const actualGarbageLines =
        garbageLines ?? (linesCleared >= 4 ? 4 : linesCleared);

      const eventId = `${socket.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const payload = {
        garbageLines: actualGarbageLines,
        linesCleared: linesCleared || actualGarbageLines,
        fromPlayer: socket.userData?.username || "Opponent",
        eventId,
        timestamp: Date.now(),
      };

      const opponents = room.players.filter((p) => p.socketId !== socket.id);
      for (const opponent of opponents) {
        io.to(opponent.socketId).emit("receive-garbage", payload);
      }
    });

    // Player moved piece
    socket.on("piece-move", ({ roomId, move }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      const opponent = room.players.find((p) => p.socketId !== socket.id);
      if (opponent) {
        io.to(opponent.socketId).emit("opponent-move", { move });
      }
    });

    // Player game over
    socket.on("game-over", ({ roomId, finalScore, stats }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;

      // Find the opponent (the winner)
      const losingPlayer = room.players.find((p) => p.socketId === socket.id);
      const winningPlayer = room.players.find((p) => p.socketId !== socket.id);

      if (winningPlayer) {
        // Declare the opponent as winner
        io.to(roomId).emit("game-end", {
          winner: {
            socketId: winningPlayer.socketId,
            username: winningPlayer.userData?.username || "Opponent",
            id: winningPlayer.userData?.id,
          },
          loser: {
            socketId: socket.id,
            username: losingPlayer?.userData?.username || "Player",
            id: losingPlayer?.userData?.id,
            finalScore,
            stats,
          },
        });

        // Clean up room after delay
        setTimeout(() => {
          gameRooms.delete(roomId);
        }, 10000); // 10 seconds to view results
      }
    });

    // Player wins
    socket.on("declare-winner", ({ roomId, winnerData }) => {
      io.to(roomId).emit("game-end", {
        winner: winnerData,
      });

      // Clean up room after delay
      setTimeout(() => {
        gameRooms.delete(roomId);
      }, 5000);
    });

    // Leave game room
    socket.on("leave-room", ({ roomId }) => {
      const room = gameRooms.get(roomId);
      if (room) {
        const opponent = room.players.find((p) => p.socketId !== socket.id);
        if (opponent) {
          io.to(opponent.socketId).emit("opponent-left");
        }

        room.players = room.players.filter((p) => p.socketId !== socket.id);
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        }
        io.emit("room-list", getRoomList());
      }
      socket.leave(roomId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Handle room cleanup
      let roomUpdated = false;
      for (const [roomId, room] of gameRooms.entries()) {
        const playerIndex = room.players.findIndex(
          (p) => p.socketId === socket.id
        );
        if (playerIndex !== -1) {
          // Notify opponent
          const opponent = room.players.find((p) => p.socketId !== socket.id);
          if (opponent) {
            io.to(opponent.socketId).emit("opponent-disconnected");
          }

          // Remove player and clean up room
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            gameRooms.delete(roomId);
          }
          roomUpdated = true;
          break;
        }
      }

      // Broadcast updated room list if any room was affected
      if (roomUpdated) {
        io.emit("room-list", getRoomList());
      }
    });

    // Debug: Get room info
    socket.on("get-room-info", ({ roomId }) => {
      const room = gameRooms.get(roomId);
      socket.emit("room-info", room || { error: "Room not found" });
    });
  });

  // Cleanup interval (remove stale rooms every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of gameRooms.entries()) {
      if (
        room.gameState.startTime &&
        now - room.gameState.startTime > 3600000
      ) {
        // 1 hour
        gameRooms.delete(roomId);
      }
    }
  }, 300000);
}

/**
 * Get statistics about active games
 */
export function getGameStats() {
  return {
    activeRooms: gameRooms.size,
    rooms: Array.from(gameRooms.entries()).map(([id, room]) => ({
      roomId: id,
      playerCount: room.players.length,
      started: room.gameState.started,
    })),
  };
}
