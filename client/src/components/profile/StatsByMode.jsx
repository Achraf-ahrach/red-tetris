import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function StatsByMode({ statsByMode, showTitle = true }) {
  const modes = [
    {
      name: "Classic",
      key: "classic",
      icon: "🎮",
      color: "text-blue-400",
      bg: "bg-blue-400/5",
      borderColor: "border-blue-400/20",
      isSolo: true,
    },
    {
      name: "Ranked",
      key: "ranked",
      icon: "🏆",
      color: "text-yellow-400",
      bg: "bg-yellow-400/5",
      borderColor: "border-yellow-400/20",
      isSolo: true,
    },
    {
      name: "Multiplayer",
      key: "multiplayer",
      icon: "👥",
      color: "text-purple-400",
      bg: "bg-purple-400/5",
      borderColor: "border-purple-400/20",
      isSolo: false,
    },
  ];

  return (
    <div className="mt-8">
      {showTitle && (
        <h2 className="text-2xl font-semibold mb-4">Stats by Game Mode</h2>
      )}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {modes.map((mode) => {
          const stats = statsByMode[mode.key] || {
            totalGames: 0,
            wins: 0,
            winRate: 0,
            highScore: 0,
            totalLines: 0,
          };

          return (
            <motion.div key={mode.key} variants={fadeInUp}>
              <Card
                className={`${mode.bg} backdrop-blur-sm border ${mode.borderColor} hover:border-opacity-40 transition-all`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{mode.icon}</span>
                      <span>{mode.name}</span>
                    </span>
                    {stats.totalGames > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {stats.totalGames} games
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mode.isSolo ? (
                    // Solo modes: Show games played, high score, total lines
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${mode.color}`}>
                            {stats.totalGames}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Played
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {stats.highScore || 0}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            High Score
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-400">
                            {stats.totalLines || 0}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Lines
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Multiplayer mode: Show games played, wins, win rate
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${mode.color}`}>
                            {stats.totalGames}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Played
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {stats.wins}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Wins
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {stats.winRate}%
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Win Rate
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {stats.totalGames === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No games played yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
