import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../services/api";
import { tr } from "zod/v4/locales";

const MultiplayerSetup = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomNameError, setRoomNameError] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: async () => {
      const res = await userAPI.getCurrentUserProfile();
      if (res?.error || res?.success === false) {
        throw new Error(res?.data?.message || "Failed to load profile");
      }
      return res?.data ?? res;
    },
  });

  useEffect(() => {
    if (!userData?.id) return;

    const newSocket = io("http://localhost:3000", {
      query: { username: userData?.username, userId: userData?.id },
    });

    setSocket(newSocket);

    // use the newly created socket instance (avoid using stale `socket` state)
    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("get-rooms");
    });

    // newSocket.on("disconnect", () => {
    //   console.log("Disconnected from server");
    //   setIsConnected(false);
    // });

    newSocket.on("rooms-list", (rooms) => {
      setAvailableRooms(rooms);
    });

    // Listen for room creation/join errors
    // newSocket.on("join-room-error", (error) => {
    //   console.error("Room join error:", error);
    //   setRoomNameError(error.message);
    //   setIsCreatingRoom(false);
    // });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [navigate, userData]);

  // Periodically refresh rooms list
  useEffect(() => {
    if (socket && isConnected) {
      const interval = setInterval(() => {
        socket.emit("get-rooms");
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [socket, isConnected]);

  const createRoom = () => {
    if (!roomName.trim()) {
      setRoomNameError("Please enter a room name!");
      return;
    }

    if (!socket || !isConnected) {
      setRoomNameError("Not connected to server. Please wait...");
      return;
    }

    setRoomNameError("");

    socket.emit("create-room", {
      roomName: roomName,
      userId: userData?.id,
      userName: userData?.username,
    });

    socket.on("create-room-error", (error) => {
      setRoomNameError(error.message);
      setIsCreatingRoom(false);
      console.error("Room creation error:", error);
    });
    socket.on("room-created", (roomName) => {
      console.log("Room created:", roomName);
      setIsCreatingRoom(true);
      navigate(`/#${roomName}[${userData?.username}]`);
    });
  };

  const joinRoom = (room) => {
    if (!socket || !isConnected) {
      alert("Not connected to server. Please wait...");
      return;
    }

    if (room.gameState === "playing" || room.players.length >= 2) {
      alert("This room is full or already in game!");
      return;
    }

    socket.emit("join-room", {
      roomId: room.id,
    });
    socket.on("join-room-error", (error) => {
      alert("Error joining room:", error.message);
    });
    socket.on("joined-room", (data) => {
      console.log("Successfully joined room:", data);
      navigate(`/#${data.roomName}[${data.userName}]`);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        <span className="text-lg">←</span>
        <span>Back to Home</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4">
            MULTIPLAYER
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Join a room or create your own battle arena!
          </p>
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Room Section */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 sticky top-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  🎮 Create Room
                </h3>
                <p className="text-gray-400">Start a new battle arena</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => {
                      setRoomName(e.target.value);
                      if (roomNameError) setRoomNameError("");
                    }}
                    placeholder="Enter room name..."
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white text-sm font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      roomNameError
                        ? "border-red-500 focus:ring-red-500"
                        : "border-white/20 focus:ring-green-500"
                    }`}
                    maxLength={30}
                    disabled={isCreatingRoom}
                  />
                  {roomNameError && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      {roomNameError}
                    </p>
                  )}
                </div>

                <button
                  onClick={createRoom}
                  disabled={isCreatingRoom || !isConnected}
                  className="w-full group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-lg shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10">
                    {isCreatingRoom ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : !isConnected ? (
                      "CONNECTING..."
                    ) : (
                      "CREATE ROOM"
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Player Info */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm mb-1">Playing as:</p>
                <p className="text-white font-bold">{userData?.nickname}</p>
              </div>
            </div>
          </div>

          {/* Available Rooms Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                🌐 Available Rooms
              </h3>
              <p className="text-gray-400">
                Click on any room to join the battle
              </p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {availableRooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 bg-white/5 backdrop-blur-sm rounded-xl border transition-all duration-300 cursor-pointer hover:bg-white/10 ${
                    room.gameState === "waiting"
                      ? "border-green-500/30 hover:border-green-500/50"
                      : "border-red-500/30 hover:border-red-500/50"
                  }`}
                  onClick={() => joinRoom(room)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-bold text-lg">
                          {room.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            room.gameState === "waiting"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : room.gameState === "playing"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {room.gameState.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {room.players && room.players.length > 0 && (
                          <span>👤 Host: {room.players[0].name}</span>
                        )}
                        <span>👥 {room.players.length}/2 players</span>
                      </div>

                      {room.players && room.players.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {room.players.map((player, index) => (
                            <span
                              key={player.id}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30"
                            >
                              {player.name} {player.ready && "✓"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {room.gameState === "waiting" &&
                      room.players.length < 2 ? (
                        <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 font-bold text-sm">
                          JOIN
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg border border-gray-500/30 font-bold text-sm">
                          {room.gameState === "playing"
                            ? "IN GAME"
                            : room.gameState === "finished"
                            ? "FINISHED"
                            : "FULL"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {availableRooms.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <h4 className="text-white font-bold text-xl mb-2">
                    No rooms available
                  </h4>
                  <p className="text-gray-400">
                    {isConnected
                      ? "Be the first to create a room!"
                      : "Connecting to server..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            🎯 How to Play
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div className="text-center">
              <div className="text-2xl mb-2">🎮</div>
              <h4 className="font-bold text-white mb-2">Controls</h4>
              <ul className="space-y-1">
                <li>Arrow keys to move</li>
                <li>Space for hard drop</li>
                <li>P to pause</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚔️</div>
              <h4 className="font-bold text-white mb-2">Battle</h4>
              <ul className="space-y-1">
                <li>Two players compete</li>
                <li>Clear lines to attack</li>
                <li>Survive the longest</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-bold text-white mb-2">Victory</h4>
              <ul className="space-y-1">
                <li>Opponent reaches top</li>
                <li>Higher score wins</li>
                <li>Be the last standing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <div className="relative z-10 text-center text-gray-400 text-sm mt-8 pb-6">
        <p>Join the battle! Select a room or create your own arena.</p>
      </div> */}
    </div>
  );
};

export default MultiplayerSetup;
