import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MultiplayerSetup = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const playerName = "Achraf_test"; // [<player_name>]

  //   const generateRoomCode = () => {
  //     return Math.random().toString(36).substr(2, 6).toUpperCase();
  //   };

  const createRoom = () => {
    if (!roomName.trim()) {
      alert("Please enter a room name!");
      return;
    }

    // • http://<server_name_or_ip>:<port>/#<room>[<player_name>]
    // const newRoomCode = generateRoomCode();
    navigate(
      `/multiplayer-game?room=${roomName}&player=${encodeURIComponent(
        playerName
      )}&host=true`
    );
  };

  const joinRoom = () => {
    if (!roomCode.trim()) {
      alert("Please enter a room code!");
      return;
    }

    // Navigate to multiplayer game with room code and player info
    // navigate(
    //   `/multiplayer-game?room=${roomCode.toUpperCase()}&player=${encodeURIComponent(
    //     playerName
    //   )}&host=false`
    // );
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
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4">
            MULTIPLAYER
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Challenge your friends in epic Tetris battles!
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-white text-lg font-semibold mb-3">
            Enter Room Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room Name"
            className="w-full max-w-md px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-center text-lg font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            maxLength={20}
          />
        </div>

        {/* Room Setup Options */}
        <div className="space-y-8">
          {/* Create Room Section */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">
                🎮 Create Room
              </h3>
              <p className="text-gray-400">
                Start a new game and invite friends
              </p>
            </div>
            <button
              onClick={createRoom}
              disabled={isCreatingRoom}
              className="group relative px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-lg shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isCreatingRoom ? "Creating..." : "CREATE ROOM"}
              </span>
              <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Join Room Section */}
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">
                🌐 Join Room
              </h3>
              <p className="text-gray-400">Enter a room code to join a game</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                className="w-full max-w-xs px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-center text-lg font-bold tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                maxLength={6}
              />
              <button
                onClick={joinRoom}
                className="group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-bold rounded-lg shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:to-indigo-700"
              >
                <span className="relative z-10">JOIN ROOM</span>
                <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">🎯 How It Works</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="text-left">
              <ul className="space-y-2">
                <li>• Two players compete simultaneously</li>
                <li>• Clear lines to send garbage to opponent</li>
                <li>• First to reach the top loses</li>
              </ul>
            </div>
            <div className="text-left">
              <ul className="space-y-2">
                <li>• Use arrow keys to move and rotate</li>
                <li>• Space bar for hard drop</li>
                <li>• P to pause</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-gray-400 text-sm">
        <p>Ready to battle? Create or join a room to get started!</p>
      </div>
    </div>
  );
};

export default MultiplayerSetup;
