import React from "react";
import { Button } from "../ui/button";
import { Loader2, Search, X, Users } from "lucide-react";

/**
 * Matchmaking component for finding 1v1 opponents
 */
export function Matchmaking({
  matchmaking,
  onFindMatch,
  onCancel,
  isConnected,
}) {
  const { searching, waiting, found } = matchmaking;

  if (found) {
    return (
      <div className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Match Found!</h3>
            <p className="text-gray-300">Preparing game room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <div className="absolute inset-0 blur-xl bg-cyan-500/30 animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Searching for Opponent...
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Finding a worthy challenger
            </p>
          </div>
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (searching && !waiting) {
    return (
      <div className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-gray-300">Connecting to matchmaking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
          <Search className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            1v1 Multiplayer
          </h2>
          <p className="text-gray-300 mb-6">
            Challenge a random opponent in real-time
          </p>
        </div>

        {!isConnected ? (
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-2" />
            <p className="text-yellow-300 text-sm">Connecting to server...</p>
          </div>
        ) : (
          <Button
            onClick={onFindMatch}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
          >
            <Search className="w-5 h-5 mr-2" />
            Find Match
          </Button>
        )}

        <div className="grid grid-cols-3 gap-4 w-full mt-4 text-center">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-2xl font-bold text-cyan-400">2</div>
            <div className="text-xs text-gray-400">Players</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-2xl font-bold text-purple-400">∞</div>
            <div className="text-xs text-gray-400">Same Pieces</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-2xl font-bold text-green-400">Live</div>
            <div className="text-xs text-gray-400">Real-time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
