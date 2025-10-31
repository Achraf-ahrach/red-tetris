import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Gamepad2, Trophy, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const gameModes = [
  {
    id: "classic",
    title: "Classic Mode",
    subtitle: "Timeless Tetris Experience",
    description:
      "Play the traditional Tetris game solo. Clear lines and reach the highest score possible. Master the fundamentals and compete for the top spot on the leaderboard.",
    icon: Gamepad2,
    color: "from-cyan-500 to-blue-500",
    features: [
      "Solo gameplay",
      "Increasing difficulty",
      "High score tracking",
      "Progressive levels",
    ],
    image: "/modes/classic.jpg",
  },
  {
    id: "multiplayer",
    title: "Multiplayer Battle",
    subtitle: "Compete in Real-Time",
    description:
      "Compete against other players in real-time. Clear lines to send penalty blocks to opponents. Watch their fields in real-time and strategize your moves.",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    features: [
      "Real-time competition",
      "Penalty system",
      "Opponent spectrum view",
      "Live rankings",
    ],
    image: "/modes/multiplayer.jpg",
  },
  {
    id: "survival",
    title: "Survival Mode",
    subtitle: "Push Your Limits",
    description:
      "Survive as long as possible with increasing speed and difficulty. How long can you last? The blocks fall faster with each passing second.",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    features: [
      "Rapid difficulty increase",
      "Endless gameplay",
      "Speed challenges",
      "Survival records",
    ],
    image: "/modes/survival.jpg",
  },
  {
    id: "ranked",
    title: "Ranked Matches",
    subtitle: "Climb the Leaderboard",
    description:
      "Compete in ranked matches to climb the leaderboard and earn achievements. Prove your skills against the best players and unlock exclusive rewards.",
    icon: Trophy,
    color: "from-yellow-500 to-amber-500",
    features: [
      "Ranked system",
      "Achievements",
      "Leaderboard rewards",
      "Seasonal rankings",
    ],
    image: "/modes/ranked.jpg",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 160,
      damping: 18,
      mass: 0.8,
    },
  },
};

export default function GameModesPage() {
  return (
    <div className="min-h-screen bg-background pl-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-3">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 border border-primary rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["0vh", "100vh"],
              rotate: [0, 360],
              opacity: [0.2, 0.4, 0.2],
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

      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto pr-4 py-8 sm:py-10">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Choose a mode
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pick how you want to play. You can change later.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary/70 uppercase tracking-widest">
            Game Modes
          </span>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 20,
                  mass: 0.7,
                }}
              >
                <Link
                  to={
                    mode.id === "multiplayer"
                      ? "/game/multiplayer"
                      : `/game/play?mode=${mode.id}`
                  }
                >
                  <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 overflow-hidden group cursor-pointer rounded-2xl transition-colors duration-300">
                    {/* Large media area with overlay content (slightly smaller) */}
                    <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                      <img
                        src={mode.image || "/modes/placeholder.svg"}
                        alt={mode.title}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.src = "/modes/placeholder.svg";
                        }}
                      />
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Top-right icon badge (slightly smaller and tighter) */}
                      <div
                        className={`absolute top-3 right-3 p-2.5 rounded-xl bg-gradient-to-br ${mode.color} text-white shadow-md shadow-black/20`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Bottom overlay content (slightly tighter spacing and type) */}
                      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                        <h3 className="text-white text-lg sm:text-xl font-bold drop-shadow-md">
                          {mode.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-widest">
                          {mode.subtitle}
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {mode.features.slice(0, 2).map((feature, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-white/30 bg-white/10 text-[10px] text-white px-2 py-0.5 backdrop-blur-sm"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-3.5 flex items-center justify-between">
                          <span className="text-[10px] text-white/70">
                            Tap to start
                          </span>
                          <span className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors">
                            Play Now <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
