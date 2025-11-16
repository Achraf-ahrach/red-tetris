import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Zap } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function RecentMatches({ userData }) {
  // Get badge color based on game mode
  const getModeBadgeClass = (mode) => {
    const modes = {
      Classic: "bg-rose-500/15 text-rose-400 border-rose-500/40",
      Ranked: "bg-amber-500/15 text-amber-400 border-amber-500/40",
      Multiplayer: "bg-purple-500/15 text-purple-400 border-purple-500/40",
      Survival: "bg-orange-500/15 text-orange-400 border-orange-500/40",
    };
    return modes[mode] || "bg-primary/15 text-primary border-primary/40";
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-3">
        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        Recent Matches
      </h2>

      <div className="space-y-2 sm:space-y-3">
        {userData.recentGames.map((game) => {
          const hasOpponent = game.opponent?.name || game.opponentName;
          const opponentName = game.opponent?.name ?? game.opponentName ?? null;
          const opponentAvatar = game.opponent?.avatar ?? null;
          const initials = opponentName
            ? opponentName
                .split(" ")
                .filter(Boolean)
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "??";

          return (
            <motion.div
              key={game.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.01, x: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="p-3 sm:p-5 bg-card/60 backdrop-blur-sm border-border/40 hover:border-primary/40 transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0 w-full sm:w-auto">
                    <Badge
                      className={`${getModeBadgeClass(
                        game.mode
                      )} px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium whitespace-nowrap`}
                    >
                      {game.mode}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg sm:text-xl font-bold text-foreground mb-0.5">
                        {game.score.toLocaleString()}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                        <span>{game.lines} lines</span>
                        {hasOpponent && opponentName && (
                          <>
                            <span className="opacity-50 hidden sm:inline">
                              •
                            </span>
                            <span className="inline-flex items-center gap-1 min-w-0">
                              <span className="opacity-80">vs</span>
                              {opponentAvatar && (
                                <Avatar className="w-3 h-3 sm:w-4 sm:h-4">
                                  <AvatarImage
                                    src={opponentAvatar}
                                    alt={opponentName}
                                  />
                                  <AvatarFallback className="text-[8px] sm:text-[9px]">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span className="truncate max-w-[80px] sm:max-w-[120px] font-medium">
                                {opponentName}
                              </span>
                            </span>
                          </>
                        )}
                        {game.duration && (
                          <>
                            <span className="opacity-50 hidden sm:inline">
                              •
                            </span>
                            <span>
                              {Math.floor(game.duration / 60)}:
                              {String(game.duration % 60).padStart(2, "0")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {game.date}
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-semibold">
                        {game.rank}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                        Level
                      </div>
                    </div>
                    {/* Show win/loss badge for games with opponents */}
                    {hasOpponent && opponentName && (
                      <Badge
                        className={
                          game.result === "win"
                            ? "bg-green-500/15 text-green-400 border-green-500/40 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium"
                            : game.result === "draw"
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/40 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium"
                            : "bg-red-500/15 text-red-400 border-red-500/40 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium"
                        }
                      >
                        {game.result === "win"
                          ? "Victory"
                          : game.result === "draw"
                          ? "Draw"
                          : "Defeat"}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
