import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, AlertCircle } from "lucide-react";
import { userAPI } from "../../services/api";
import { LoadingSpinner } from "@/components/ui/loading";
  

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
  return (
    <span className="text-muted-foreground font-semibold text-lg">#{rank}</span>
  );
};

const getWinRateColor = (rate) => {
  if (rate >= 90) return "text-green-500";
  if (rate >= 80) return "text-blue-500";
  if (rate >= 70) return "text-yellow-500";
  return "text-orange-500";
};

const LoadingSection = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex items-center gap-3 text-muted-foreground">
      <LoadingSpinner />
      <span>Loading leaderboard…</span>
    </div>
  </div>
);

const ErrorSection = ({ message }) => (
  <div className="flex items-center justify-center py-16">
    <div className="flex items-center gap-3 text-destructive">
      <AlertCircle className="w-5 h-5" />
      <span>{message || "Failed to load leaderboard"}</span>
    </div>
  </div>
);

export default function LeaderboardPage() {
  const limit = 50;
  const {
    data: leaderboardData = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const res = await userAPI.getLeaderboard(limit);
      if (res?.error) {
        const msg = res?.data?.message || "Failed to fetch leaderboard";
        throw new Error(msg);
      }
      return res;
    },
    select: (res) => {
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      return raw.map((p, idx) => {
        const totalWins = p.totalWins ?? p.wins ?? p.stats?.wins ?? 0;
        const totalGames = p.totalGames ?? p.games ?? p.stats?.games ?? 0;
        const winRate =
          p.winRate ??
          (totalGames ? Math.round((totalWins / totalGames) * 100) : 0);
        const name = p.name ?? p.displayName ?? p.username ?? "Player";
        const username =
          p.username ??
          (name?.toLowerCase?.().replace(/\s+/g, "") || `player${idx + 1}`);
        return {
          rank: p.rank ?? idx + 1,
          avatar: p.avatar ?? p.profileImage ?? "",
          name,
          username,
          score: p.highScore ?? p.score ?? p.bestScore ?? 0,
          winRate,
        };
      });
    },
    staleTime: 60_000,
  });

  const topThree = leaderboardData.slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <LoadingSection />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <ErrorSection message={error?.message} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 border-2 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              borderColor: ["#00f0ff", "#ffff00", "#ff8800", "#00ff00"][i % 4],
            }}
            animate={{
              y: ["0vh", "110vh"],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            <p className="text-muted-foreground text-lg">
              Top Tetris Champions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:mt-12"
            >
              <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-gray-400/50 hover:border-gray-400 transition-all duration-300 hover:shadow-lg hover:shadow-gray-400/20 hover:-translate-y-1">
                <CardContent className="pt-8 text-center space-y-4">
                  <Medal className="w-14 h-14 text-gray-400 mx-auto" />
                  <Avatar className="w-20 h-20 mx-auto border-4 border-gray-400 shadow-lg">
                    <AvatarImage
                      src={topThree[1]?.avatar || "/placeholder.svg"}
                      alt={topThree[1]?.name || "Player"}
                    />
                    <AvatarFallback>
                      {topThree[1]?.name?.[0] ?? "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-xl">
                      {topThree[1]?.name || "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{topThree[1]?.username || ""}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-400">
                      {Number(topThree[1]?.score ?? 0).toLocaleString()}
                    </p>
                    <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/50 text-base px-3 py-1">
                      {topThree[1]?.winRate ?? 0}% Win Rate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-yellow-500/10 to-card/95 backdrop-blur-sm border-yellow-400/60 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/30 hover:-translate-y-2">
                <CardContent className="pt-8 text-center space-y-4">
                  <Crown className="w-16 h-16 text-yellow-400 mx-auto animate-pulse" />
                  <Avatar className="w-24 h-24 mx-auto border-4 border-yellow-400 shadow-xl shadow-yellow-400/30">
                    <AvatarImage
                      src={topThree[0]?.avatar || "/placeholder.svg"}
                      alt={topThree[0]?.name || "Player"}
                    />
                    <AvatarFallback>
                      {topThree[0]?.name?.[0] ?? "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-2xl bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                      {topThree[0]?.name || "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{topThree[0]?.username || ""}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold text-yellow-400">
                      {Number(topThree[0]?.score ?? 0).toLocaleString()}
                    </p>
                    <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/50 text-base px-3 py-1">
                      {topThree[0]?.winRate ?? 0}% Win Rate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:mt-12"
            >
              <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-amber-600/50 hover:border-amber-600 transition-all duration-300 hover:shadow-lg hover:shadow-amber-600/20 hover:-translate-y-1">
                <CardContent className="pt-8 text-center space-y-4">
                  <Medal className="w-14 h-14 text-amber-600 mx-auto" />
                  <Avatar className="w-20 h-20 mx-auto border-4 border-amber-600 shadow-lg">
                    <AvatarImage
                      src={topThree[2]?.avatar || "/placeholder.svg"}
                      alt={topThree[2]?.name || "Player"}
                    />
                    <AvatarFallback>
                      {topThree[2]?.name?.[0] ?? "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-xl">
                      {topThree[2]?.name || "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{topThree[2]?.username || ""}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-amber-600">
                      {Number(topThree[2]?.score ?? 0).toLocaleString()}
                    </p>
                    <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/50 text-base px-3 py-1">
                      {topThree[2]?.winRate ?? 0}% Win Rate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-card/95 backdrop-blur-sm border-primary/30">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card/95 backdrop-blur-sm">
                      <tr className="border-b border-border/50">
                        <th className="text-left p-3 md:p-4 font-semibold text-muted-foreground">
                          Rank
                        </th>
                        <th className="text-left p-3 md:p-4 font-semibold text-muted-foreground">
                          Player
                        </th>
                        <th className="text-right p-3 md:p-4 font-semibold text-muted-foreground">
                          Score
                        </th>
                        <th className="text-right p-3 md:p-4 font-semibold text-muted-foreground">
                          Win Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((player, index) => (
                        <motion.tr
                          key={player.username || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.05 + index * 0.02,
                            duration: 0.25,
                          }}
                          className={`border-b border-border/30 hover:bg-primary/5 transition-colors duration-150 ${
                            index % 2 === 0
                              ? "bg-background/30"
                              : "bg-background/20"
                          }`}
                        >
                          <td className="p-3 md:p-4">
                            <div className="flex items-center justify-start">
                              {getRankIcon(player.rank)}
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-primary/30">
                                <AvatarImage
                                  src={player.avatar || "/placeholder.svg"}
                                  alt={player.name || "Player"}
                                />
                                <AvatarFallback>
                                  {player.name?.[0] ?? "P"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold leading-tight">
                                  {player.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{player.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <span className="text-primary font-bold">
                              {Number(player.score || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <span
                              className={`font-bold ${getWinRateColor(
                                player.winRate || 0
                              )}`}
                            >
                              {player.winRate || 0}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
