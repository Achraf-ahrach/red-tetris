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
  return Array.from(gameRooms.values())
    .filter((room) => !room.gameState.finished) // Hide finished rooms
    .map((room) => ({
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

    // Get room by name for URL-based joining
    socket.on("get-room-by-name", ({ roomName }) => {
      // Find room by name
      const room = Array.from(gameRooms.values()).find(
        (r) => r.roomName === roomName
      );

      if (room) {
        socket.emit("room-found", {
          roomId: room.roomId,
          roomName: room.roomName,
          players: room.players.map((p) => p.userData),
          pieceSequence: room.gameState.pieceSequence,
        });
      } else {
        socket.emit("room-not-found", { roomName });
      }
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

      // Notify creator with room info (but don't auto-join)
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

      // Check if player is already in the room (prevent duplicate joins)
      const alreadyInRoom = room.players.some(
        (p) => p.socketId === socket.id || p.userData?.id === userId
      );

      if (alreadyInRoom) {
        console.log(`Player ${username} (${userId}) already in room ${roomId}`);
        // Just send them the room info again instead of error
        socket.emit("room-joined", {
          roomId,
          isHost: room.hostSocketId === socket.id,
          room: {
            roomId: room.roomId,
            roomName: room.roomName,
            players: room.players.map((p) => p.userData),
            pieceSequence: room.gameState.pieceSequence,
          },
        });
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

      // First player becomes host
      const isHost = room.players.length === 1;
      if (isHost) {
        room.hostSocketId = socket.id;
      }

      console.log(
        `Player ${username} joined room ${room.roomName}. Total players: ${room.players.length}`
      );

      // Notify player they joined
      socket.emit("room-joined", {
        roomId,
        isHost,
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

      // No longer auto-start when room is full - host controls start
    });

    // Host starts the game
    socket.on("host-start-game", ({ roomId }) => {
      const room = gameRooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Verify socket is the host
      if (room.hostSocketId !== socket.id) {
        socket.emit("error", { message: "Only the host can start the game" });
        return;
      }

      if (room.gameState.started) {
        socket.emit("error", { message: "Game already started" });
        return;
      }

      // Require 2 players for multiplayer mode
      if (room.players.length < 2) {
        socket.emit("error", { message: "Need 2 players to start the game" });
        return;
      }

      // Start the game
      startGame(io, roomId);
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

      // Prevent duplicate game-over events
      if (room.gameState.finished) return;

      // Mark room as finished
      room.gameState.finished = true;

      console.log(
        `[GAME-OVER] ${losingPlayer?.userData?.username} lost in room ${
          room.roomName
        }. Winner: ${winningPlayer?.userData?.username || "None (solo)"}`
      );

      // Find the opponent (the winner)
      const losingPlayer = room.players.find((p) => p.socketId === socket.id);
      const winningPlayer = room.players.find((p) => p.socketId !== socket.id);

      if (winningPlayer) {
        // Multiplayer: Declare the opponent as winner
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
      } else {
        // Solo play: Game just ended (shouldn't happen in multiplayer, but handle it)
        io.to(roomId).emit("game-end", {
          solo: true,
          player: {
            socketId: socket.id,
            username: losingPlayer?.userData?.username || "Player",
            id: losingPlayer?.userData?.id,
            finalScore,
            stats,
          },
        });
      }

      // Broadcast updated room list (room will be filtered out as finished)
      io.emit("room-list", getRoomList());

      // Clean up room after delay
      setTimeout(() => {
        gameRooms.delete(roomId);
        io.emit("room-list", getRoomList());
      }, 10000); // 10 seconds to view results
    });

    // Player wins
    socket.on("declare-winner", ({ roomId, winnerData }) => {
      const room = gameRooms.get(roomId);
      if (room) {
        room.gameState.finished = true;
      }

      io.to(roomId).emit("game-end", {
        winner: winnerData,
      });

      // Broadcast updated room list
      io.emit("room-list", getRoomList());

      // Clean up room after delay
      setTimeout(() => {
        gameRooms.delete(roomId);
        io.emit("room-list", getRoomList());
      }, 5000);
    });

    // Leave game room
    socket.on("leave-room", ({ roomId }) => {
      const room = gameRooms.get(roomId);
      if (!room) {
        socket.leave(roomId);
        return;
      }

      const wasHost = room.hostSocketId === socket.id;
      const leavingPlayer = room.players.find((p) => p.socketId === socket.id);
      const opponent = room.players.find((p) => p.socketId !== socket.id);

      // If game was in progress, declare opponent as winner
      if (room.gameState.started && !room.gameState.finished && opponent) {
        room.gameState.finished = true;

        console.log(
          `[LEAVE] ${leavingPlayer?.userData?.username} left active game in room ${room.roomName}. ${opponent.userData?.username} wins.`
        );

        // Notify both players about game end
        io.to(roomId).emit("game-end", {
          winner: {
            socketId: opponent.socketId,
            username: opponent.userData?.username || "Opponent",
            id: opponent.userData?.id,
          },
          loser: {
            socketId: socket.id,
            username: leavingPlayer?.userData?.username || "Player",
            id: leavingPlayer?.userData?.id,
            reason: "left the game",
          },
        });

        // Broadcast updated room list (room will be filtered out as finished)
        io.emit("room-list", getRoomList());

        // Clean up room after delay
        setTimeout(() => {
          gameRooms.delete(roomId);
          io.emit("room-list", getRoomList());
        }, 10000); // 10 seconds to view results
      } else {
        // Game not started - handle lobby leave
        console.log(
          `[LEAVE] ${leavingPlayer?.userData?.username} left lobby in room ${
            room.roomName
          }. Players remaining: ${room.players.length - 1}`
        );

        // Notify opponent before removing player
        if (opponent) {
          io.to(opponent.socketId).emit("opponent-left", {
            player: leavingPlayer?.userData,
            playerCount: room.players.length - 1,
          });
        }

        // Remove player from room
        room.players = room.players.filter((p) => p.socketId !== socket.id);

        // Transfer host to remaining player if host left
        if (wasHost && room.players.length > 0) {
          room.hostSocketId = room.players[0].socketId;
          io.to(room.hostSocketId).emit("host-transferred", {
            isHost: true,
            message: "You are now the host",
          });
        }

        // Notify remaining players about updated player count
        if (room.players.length > 0) {
          io.to(roomId).emit("player-left", {
            playerCount: room.players.length,
          });
        }

        // Delete room if empty
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        }

        // Broadcast updated room list
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
          const wasHost = room.hostSocketId === socket.id;
          const disconnectingPlayer = room.players[playerIndex];
          const opponent = room.players.find((p) => p.socketId !== socket.id);

          // If game was in progress, declare opponent as winner
          if (room.gameState.started && !room.gameState.finished && opponent) {
            room.gameState.finished = true;

            console.log(
              `[DISCONNECT] ${disconnectingPlayer?.userData?.username} disconnected from active game in room ${room.roomName}. ${opponent.userData?.username} wins.`
            );

            // Notify opponent about game end
            io.to(opponent.socketId).emit("game-end", {
              winner: {
                socketId: opponent.socketId,
                username: opponent.userData?.username || "Opponent",
                id: opponent.userData?.id,
              },
              loser: {
                socketId: socket.id,
                username: disconnectingPlayer?.userData?.username || "Player",
                id: disconnectingPlayer?.userData?.id,
                reason: "disconnected",
              },
            });

            // Broadcast updated room list (room will be filtered out as finished)
            io.emit("room-list", getRoomList());

            // Clean up room after delay
            setTimeout(() => {
              gameRooms.delete(roomId);
              io.emit("room-list", getRoomList());
            }, 10000); // 10 seconds to view results
          } else {
            // Game not started - handle lobby disconnect
            console.log(
              `[DISCONNECT] ${
                disconnectingPlayer?.userData?.username
              } disconnected from lobby in room ${
                room.roomName
              }. Players remaining: ${room.players.length - 1}`
            );

            // Notify opponent before removing player
            if (opponent) {
              io.to(opponent.socketId).emit("opponent-disconnected", {
                player: disconnectingPlayer?.userData,
                playerCount: room.players.length - 1,
              });
            }

            // Remove player
            room.players.splice(playerIndex, 1);

            // Transfer host to remaining player if host disconnected
            if (wasHost && room.players.length > 0) {
              room.hostSocketId = room.players[0].socketId;
              io.to(room.hostSocketId).emit("host-transferred", {
                isHost: true,
                message: "You are now the host",
              });
            }

            // Notify remaining players about updated player count
            if (room.players.length > 0) {
              io.to(roomId).emit("player-left", {
                playerCount: room.players.length,
              });
            }

            // Clean up room if empty
            if (room.players.length === 0) {
              gameRooms.delete(roomId);
            }
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
