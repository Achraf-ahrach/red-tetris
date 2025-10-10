import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { userAPI } from "../../services/api";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const getRankIcon = (rank) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return (
    <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
  );
};

const getSkillBadgeColor = (skillLevel) => {
  switch (skillLevel) {
    case "Master":
      return "border-purple-500 text-purple-400 bg-purple-500/10";
    case "Expert":
      return "border-pink-500 text-pink-400 bg-pink-500/10";
    case "Advanced":
      return "border-blue-500 text-blue-400 bg-blue-500/10";
    case "Intermediate":
      return "border-green-500 text-green-400 bg-green-500/10";
    default:
      return "border-gray-500 text-gray-400 bg-gray-500/10";
  }
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getLeaderboard(50);

        if (!response?.error && Array.isArray(response.data)) {
          setLeaderboardData(response.data);
        } else if (response?.data && response?.success) {
          setLeaderboardData(response.data);
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch leaderboard"
          );
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="pl-16 relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">
              Loading leaderboard...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-16 relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load leaderboard</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background grid overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="pl-16 relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Global Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Top players ranked by their highest scores
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {leaderboardData.map((player, index) => (
              <motion.div key={player.id ?? index} variants={fadeInUp}>
                <Card
                  className={`p-4 bg-card/60 backdrop-blur-sm border transition-all hover:border-primary/50 ${
                    index < 3
                      ? "border-primary/30 shadow shadow-primary/10"
                      : "border-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(player.rank)}
                      </div>

                      {/* Player Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          {player.avatar ? (
                            <img
                              src={player.avatar}
                              alt={player.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-primary">
                              {player.username?.charAt(0)?.toUpperCase?.() ||
                                "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{player.username}</h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getSkillBadgeColor(
                                "Advanced"
                              )} `}
                            >
                              Level {player.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {player.winRate}% win rate
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {Number(player.highScore || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.totalWins}W / {player.totalGames}G
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {leaderboardData.length === 0 && !loading && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No players found</p>
              <p className="text-sm text-muted-foreground">
                Be the first to set a high score!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
