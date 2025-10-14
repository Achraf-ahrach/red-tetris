import { Server } from "socket.io";
import crypto from "crypto";
import { connect } from "http2";
class GameRoom {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.players = []; // array of socket objects, max 2
    this.gameState = "waiting"; // waiting | playing | finished
    this.gameData = new Map(); // playerId -> playerGameData
  }

  addPlayer(socket) {
    const userId = socket.handshake.query.userId;
    const name = socket.handshake.query.username;
    if (this.isFull()) return null;

    const player = {
      id: userId,
      socketId: socket.id,
      name: name,
      connected: true,
    };

    this.players.push(player);
    this.gameData.set(player.socketId, {
      ready: false,
      score: 0,
      lines: 0,
      level: 1,
    });
    return player;
  }

  // removePlayer(socketId) {}

  setPlayerReady(userId) {
    const GameData = this.gameData.get(userId);
    if (GameData) {
      GameData.ready = true;
      this.gameData.set(userId, GameData);
    }
  }

  getPlayer(userId) {
    return this.players.find((p) => p.id === userId) || null;
  }

  isFull() {
    return this.players.length === 2;
  }

  isEmpty() {
    return this.players.length === 0;
  }

  allPlayersReady() {
    if (this.players.length < 2) return false;
    return this.players.every((p) => {
      const GameData = this.gameData.get(p.Socket_id);
      return GameData && GameData.ready;
    });
  }

  getRoomInfo() {
    return {
      id: this.id,
      gameState: this.gameState,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        socketId: p.socketId,
        ready: this.gameData.get(p.socketId)?.ready,
      })),
    };
  }
}

class SocketHandler {
  constructor() {
    this.io = null;
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRooms = new Map(); // playerId -> roomId
  }
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.handshake.query.username}`);
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
      socket.on("game-over", (data) => this.handleGameOver(socket, data)); //

      // Handle disconnect
      socket.on("disconnect", () => this.handleDisconnect(socket));

      // Handle room list request
      socket.on("get-rooms", () => this.handleGetRooms(socket));

      // Handle create room
      socket.on("create-room", (data) => this.handleCreateRoom(socket, data));
    });

    console.log("Socket.IO server initialized");
  }

  isUserInAnyRoom(userId) {
    return this.playerRooms.has(userId);
  }

  handleJoinRoom(socket, data) {
    const userId = socket.handshake.query.userId;
    const { roomId } = data;

    if (!roomId) {
      socket.emit("error", { message: "Room ID is required" });
      return;
    }
    if (this.isUserInAnyRoom(userId)) {
      // change old socket to new socket
      let roomUser = this.rooms.get(this.playerRooms.get(userId));
      if (roomUser) {
        roomUser.socketId = socket.id;
      }
    }

    // Leave current room if in one
    // this.handleLeaveRoom(socket);

    // Find or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      socket.emit("join-room-error", { message: "Room not found" });
      return;
    }

    // Check if room is full
    if (room.isFull()) {
      socket.emit("join-room-error", { message: "Room is full" });
      return;
    }

    // Add player to room
    const player = room.addPlayer(socket);
    if (!player) {
      socket.emit("join-room-error", { message: "Could not join room" });
      return;
    }

    socket.join(roomId);
    this.playerRooms.set(userId, roomId);

    // Notify player of successful join
    socket.emit("joined-room", {
      roomName: room.name,
      userName: player.name,
    });

    // Notify other players in room
    socket.to(roomId).emit("player-joined", {
      player: {
        id: player.id,
        name: player.name,
        connected: player.connected,
      },
      room: room.getRoomInfo(),
    });

    console.log(
      `Player id: ${userId}, name: ${player.name} , joined room: ${room.name}`
    );
  }

  handleLeaveRoom(userId) {
    const roomId = this.playerRooms.get(userId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameData = "finished";

    // Notify all players of game over
    this.io.to(roomId).emit("PlayerGiveUp", {
      playerId: userId,
      // finalScore: room.gameData.get(userId)?.score,
      // room: room.getRoomInfo(),
    });
    console.log(`Player id: ${userId} gave up in room ${roomId}`);

    // remove room
    this.rooms.delete(roomId);

    // Remove player from tracking
    this.playerRooms.delete(userId);

    // Leave socket room
    const socket = this.io.sockets.sockets.get(userId);
    if (socket) {
      socket.leave(roomId);
    }
  }

  // handlePlayerReady(socket) {
  //   const roomId = this.playerRooms.get(socket.id);
  //   if (!roomId) return;

  //   const room = this.rooms.get(roomId);
  //   if (!room) return;

  //   const player = room.getPlayer(socket.id);
  //   if (!player) return;

  //   player.ready = !player.ready;

  //   // Update game data
  //   if (player.playerNumber === 1) {
  //     room.gameData.player1.ready = player.ready;
  //   } else {
  //     room.gameData.player2.ready = player.ready;
  //   }

  //   // Notify all players in room
  //   this.io.to(roomId).emit("player-ready-changed", {
  //     playerId: socket.id,
  //     ready: player.ready,
  //     room: room.getRoomInfo(),
  //   });

  //   // Start game if all players are ready
  //   if (room.allPlayersReady()) {
  //     room.gameState = "playing";
  //     this.io.to(roomId).emit("game-start", {
  //       room: room.getRoomInfo(),
  //     });
  //     console.log(`Game started in room ${roomId}`);
  //   }
  // }

  // handleGameAction(socket, data) {
  //   const roomId = this.playerRooms.get(socket.id);
  //   if (!roomId) return;

  //   const room = this.rooms.get(roomId);
  //   if (!room || room.gameState !== "playing") return;

  //   // Broadcast game action to other players in room
  //   socket.to(roomId).emit("opponent-action", {
  //     playerId: socket.id,
  //     action: data,
  //   });
  // }

  // handleGameUpdate(socket, data) {
  //   const roomId = this.playerRooms.get(socket.id);
  //   if (!roomId) return;

  //   const room = this.rooms.get(roomId);
  //   if (!room || room.gameState !== "playing") return;

  //   const player = room.getPlayer(socket.id);
  //   if (!player) return;

  //   // Update player game data
  //   const playerData =
  //     player.playerNumber === 1 ? room.gameData.player1 : room.gameData.player2;
  //   if (data.score !== undefined) playerData.score = data.score;
  //   if (data.lines !== undefined) playerData.lines = data.lines;
  //   if (data.level !== undefined) playerData.level = data.level;

  //   // Broadcast update to all players in room
  //   this.io.to(roomId).emit("game-update", {
  //     playerId: socket.id,
  //     playerNumber: player.playerNumber,
  //     gameData: data,
  //   });
  // }

  // handleLineClear(socket, data) {
  //   const roomId = this.playerRooms.get(socket.id);
  //   if (!roomId) return;

  //   const room = this.rooms.get(roomId);
  //   if (!room || room.gameState !== "playing") return;

  //   // Send attack to opponent
  //   socket.to(roomId).emit("receive-attack", {
  //     lines: data.lines,
  //     from: socket.id,
  //   });

  //   console.log(
  //     `Player ${socket.id} sent attack of ${data.lines} lines in room ${roomId}`
  //   );
  // }

  handleGameOver(socket, userId) {
    const roomId = this.playerRooms.get(userId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.gameState = "finished";

    // Notify all players of game over
    this.io.to(roomId).emit("game-over", {
      playerId: userId,
      finalScore: room.gameData.get(userId)?.score,
      // room: room.getRoomInfo(),
    });

    console.log(`Game over in room ${roomId}, player ${userId} finished`);
  }

  handleCreateRoom(socket, data) {
    const { roomName, userId, userName } = data;
    if (!roomName || typeof roomName !== "string") {
      socket.emit("create-room-error", { message: "Invalid room name" });
      return;
    }

    let roomId = crypto.randomBytes(10).toString("hex");
    const newRoom = new GameRoom(roomId, roomName);

    newRoom.players.push({
      id: userId,
      name: userName,
      socketId: socket.id,
      connected: true,
    });

    newRoom.gameData.set(userId, {
      ready: false,
      score: 0,
      lines: 0,
      level: 1,
    });

    this.rooms.set(roomId, newRoom);
    this.playerRooms.set(userId, roomId);
    socket.join(roomId);
    console.log("");
    socket.emit("room-created", roomName);
    console.log(`Room created: ${roomId} (${roomName})`);
  }

  handleGetRooms(socket) {
    const roomList = Array.from(this.rooms.values()).map((room) => ({
      id: room.id,
      name: room.name,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        ready: room.gameData.get(p.id)?.ready,
      })),
      gameState: room.gameState,
    }));

    socket.emit("rooms-list", roomList);
  }

  handleDisconnect(socket) {
    const userId = socket.handshake.query.userId;
    console.log(`User disconnected: ${userId}`);
    // i want set coonnected = false for this player in the room
  }

  // Public methods for external use
  // getRooms() {
  //   return Array.from(this.rooms.values()).map((room) => room.getRoomInfo());
  // }

  // getRoom(roomId) {
  //   const room = this.rooms.get(roomId);
  //   return room ? room.getRoomInfo() : null;
  // }
}

export default SocketHandler;
