import { Server } from "socket.io";

class GameRoom {
  constructor(id) {
    this.id = id;
    this.players = [];
    this.maxPlayers = 2;
    this.gameState = "waiting"; // waiting, playing, finished
    this.gameData = {
      player1: { ready: false, score: 0, lines: 0, level: 1 },
      player2: { ready: false, score: 0, lines: 0, level: 1 },
    };
  }

  addPlayer(socket) {
    if (this.players.length >= this.maxPlayers) {
      return false;
    }

    const playerNumber = this.players.length + 1;
    const player = {
      id: socket.id,
      playerNumber: playerNumber,
      nickname: socket.handshake.query.nickname || `Player ${playerNumber}`,
      ready: false,
    };

    this.players.push(player);
    // Store socket reference separately for internal use
    this.playerSockets = this.playerSockets || new Map();
    this.playerSockets.set(socket.id, socket);

    return player;
  }

  removePlayer(socketId) {
    const playerIndex = this.players.findIndex((p) => p.id === socketId);
    if (playerIndex !== -1) {
      this.players.splice(playerIndex, 1);
      // Remove socket reference
      if (this.playerSockets) {
        this.playerSockets.delete(socketId);
      }
      // Reset game state if a player leaves
      this.gameState = "waiting";
      this.resetGameData();
    }
  }

  getPlayer(socketId) {
    return this.players.find((p) => p.id === socketId);
  }

  getPlayerSocket(socketId) {
    return this.playerSockets ? this.playerSockets.get(socketId) : null;
  }

  isFull() {
    return this.players.length >= this.maxPlayers;
  }

  isEmpty() {
    return this.players.length === 0;
  }

  allPlayersReady() {
    return this.players.length === 2 && this.players.every((p) => p.ready);
  }

  resetGameData() {
    this.gameData = {
      player1: { ready: false, score: 0, lines: 0, level: 1 },
      player2: { ready: false, score: 0, lines: 0, level: 1 },
    };
    this.players.forEach((p) => (p.ready = false));
  }

  getRoomInfo() {
    return {
      id: this.id,
      players: this.players.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        playerNumber: p.playerNumber,
        ready: p.ready,
      })),
      gameState: this.gameState,
      playerCount: this.players.length,
      maxPlayers: this.maxPlayers,
    };
  }
}

class SocketHandler {
  constructor() {
    this.io = null;
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRooms = new Map(); // socketId -> roomId
  }
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle room joining
      socket.on("join-room", (data) => this.handleJoinRoom(socket, data));

      // Handle leaving room
      socket.on("leave-room", () => this.handleLeaveRoom(socket));

      // Handle player ready
      socket.on("player-ready", () => this.handlePlayerReady(socket));

      // Handle game actions
      socket.on("game-action", (data) => this.handleGameAction(socket, data));

      // Handle game update (piece movement, rotation, etc.)
      socket.on("game-update", (data) => this.handleGameUpdate(socket, data));

      // Handle line clear (attack opponent)
      socket.on("line-clear", (data) => this.handleLineClear(socket, data));

      // Handle game over
      socket.on("game-over", (data) => this.handleGameOver(socket, data));

      // Handle disconnect
      socket.on("disconnect", () => this.handleDisconnect(socket));

      // Handle room list request
      socket.on("get-rooms", () => this.handleGetRooms(socket));

      // Handle create room
      socket.on("create-room", (data) => this.handleCreateRoom(socket, data));
    });

    console.log("Socket.IO server initialized");
  }

  handleJoinRoom(socket, data) {
    const { roomId, nickname } = data;

    if (!roomId) {
      socket.emit("error", { message: "Room ID is required" });
      return;
    }

    // Leave current room if in one
    this.handleLeaveRoom(socket);

    // Find or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new GameRoom(roomId);
      this.rooms.set(roomId, room);
    }

    // Check if room is full
    if (room.isFull()) {
      socket.emit("join-room-error", { message: "Room is full" });
      return;
    }

    // Set nickname if provided
    if (nickname) {
      socket.handshake.query.nickname = nickname;
    }

    // Add player to room
    const player = room.addPlayer(socket);
    if (!player) {
      socket.emit("join-room-error", { message: "Could not join room" });
      return;
    }

    // Join socket room
    socket.join(roomId);
    this.playerRooms.set(socket.id, roomId);

    // Notify player of successful join
    socket.emit("joined-room", {
      room: room.getRoomInfo(),
      player: {
        id: player.id,
        nickname: player.nickname,
        playerNumber: player.playerNumber,
        ready: player.ready,
      },
    });

    // Notify other players in room
    socket.to(roomId).emit("player-joined", {
      player: {
        id: player.id,
        nickname: player.nickname,
        playerNumber: player.playerNumber,
        ready: player.ready,
      },
      room: room.getRoomInfo(),
    });

    console.log(
      `Player id: ${socket.id}, name: ${player.nickname} , joined room: ${roomId}`
    );
  }

  handleLeaveRoom(socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room) {
      const player = room.getPlayer(socket.id);
      room.removePlayer(socket.id);

      // Leave socket room
      socket.leave(roomId);

      // Notify other players
      socket.to(roomId).emit("player-left", {
        playerId: socket.id,
        room: room.getRoomInfo(),
      });

      // Remove room if empty
      if (room.isEmpty()) {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }

      console.log(`Player ${socket.id} left room ${roomId}`);
    }

    this.playerRooms.delete(socket.id);
  }

  handlePlayerReady(socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.getPlayer(socket.id);
    if (!player) return;

    player.ready = !player.ready;

    // Update game data
    if (player.playerNumber === 1) {
      room.gameData.player1.ready = player.ready;
    } else {
      room.gameData.player2.ready = player.ready;
    }

    // Notify all players in room
    this.io.to(roomId).emit("player-ready-changed", {
      playerId: socket.id,
      ready: player.ready,
      room: room.getRoomInfo(),
    });

    // Start game if all players are ready
    if (room.allPlayersReady()) {
      room.gameState = "playing";
      this.io.to(roomId).emit("game-start", {
        room: room.getRoomInfo(),
      });
      console.log(`Game started in room ${roomId}`);
    }
  }

  handleGameAction(socket, data) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== "playing") return;

    // Broadcast game action to other players in room
    socket.to(roomId).emit("opponent-action", {
      playerId: socket.id,
      action: data,
    });
  }

  handleGameUpdate(socket, data) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== "playing") return;

    const player = room.getPlayer(socket.id);
    if (!player) return;

    // Update player game data
    const playerData =
      player.playerNumber === 1 ? room.gameData.player1 : room.gameData.player2;
    if (data.score !== undefined) playerData.score = data.score;
    if (data.lines !== undefined) playerData.lines = data.lines;
    if (data.level !== undefined) playerData.level = data.level;

    // Broadcast update to all players in room
    this.io.to(roomId).emit("game-update", {
      playerId: socket.id,
      playerNumber: player.playerNumber,
      gameData: data,
    });
  }

  handleLineClear(socket, data) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== "playing") return;

    // Send attack to opponent
    socket.to(roomId).emit("receive-attack", {
      lines: data.lines,
      from: socket.id,
    });

    console.log(
      `Player ${socket.id} sent attack of ${data.lines} lines in room ${roomId}`
    );
  }

  handleGameOver(socket, data) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameState = "finished";

    // Notify all players of game over
    this.io.to(roomId).emit("game-over", {
      playerId: socket.id,
      winner: data.winner,
      finalScore: data.score,
      room: room.getRoomInfo(),
    });

    // Reset room after a delay
    setTimeout(() => {
      if (room && this.rooms.has(roomId)) {
        room.gameState = "waiting";
        room.resetGameData();
        this.io.to(roomId).emit("room-reset", {
          room: room.getRoomInfo(),
        });
      }
    }, 5000);

    console.log(`Game over in room ${roomId}, player ${socket.id} finished`);
  }

  handleCreateRoom(socket, data) {
    const { nickname, roomName } = data;
    let roomId;

    if (roomName) {
      // Use the provided room name, cleaned up
      roomId = roomName.toUpperCase().replace(/\s+/g, "_").substring(0, 8);
    } else {
      // Generate a random room ID if no room name provided
      roomId = this.generateRoomId();
    }
    this.handleJoinRoom(socket, { roomId, nickname });
  }

  handleGetRooms(socket) {
    const roomList = Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      gameState: room.gameState,
      players: room.players.map((p) => ({
        nickname: p.nickname,
        ready: p.ready,
      })),
    }));

    socket.emit("rooms-list", roomList);
  }

  handleDisconnect(socket) {
    console.log(`User disconnected: ${socket.id}`);
    this.handleLeaveRoom(socket);
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Public methods for external use
  getRooms() {
    return Array.from(this.rooms.values()).map((room) => room.getRoomInfo());
  }

  getRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.getRoomInfo() : null;
  }
}

export default SocketHandler;
