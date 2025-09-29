import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const startGame = () => {
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4 animate-pulse">
            RED TETRIS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Experience the classic puzzle game with a modern twist. Stack,
            clear, and dominate the blocks!
          </p>
        </div>

        {/* Game Preview */}
        <div className="mb-10">
          <div className="inline-block p-4 bg-black/40 rounded-lg backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-1 w-24 h-24">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${
                    [0, 1, 4, 5, 8, 9, 12, 13].includes(i)
                      ? "bg-red-500"
                      : "bg-gray-700/50"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 space-x-4 mb-12">
          <button
            onClick={startGame}
            className="group relative px-12 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xl font-bold rounded-xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:from-red-600 hover:to-pink-700"
          >
            <span className="relative z-10">🎮 SINGLE PLAYER</span>
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={() => navigate("/multiplayer")}
            className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-bold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:to-indigo-700"
          >
            <span className="relative z-10">🌐 MULTIPLAYER</span>
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20">
              How to Play
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20">
              Leaderboard
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-3xl mb-3">🎮</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Classic Gameplay
            </h3>
            <p className="text-gray-400 text-sm">
              Enjoy the timeless Tetris experience with smooth controls
            </p>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-400 text-sm">
              Optimized for performance with real-time gameplay
            </p>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Competitive
            </h3>
            <p className="text-gray-400 text-sm">
              Challenge yourself and compete for high scores
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-gray-400 text-sm">
        <p>&copy; 2025 Red Tetris. Built with React & Vite.</p>
      </div>
    </div>
  );
};

export default LandingPage;
