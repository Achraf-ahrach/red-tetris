import React from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function StatsGrid({ stats, userData }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {[
        {
          label: "Games",
          value: userData.stats.totalGames,
          color: "text-primary",
          icon: "🎮",
          bg: "bg-primary/5",
        },
        {
          label: "Wins",
          value: userData.stats.wins,
          color: "text-green-400",
          icon: "🏆",
          bg: "bg-green-400/5",
        },
        {
          label: "Win Rate",
          value: `${userData.stats.winRate}%`,
          color: "text-accent",
          icon: "📊",
          bg: "bg-accent/5",
        },
        {
          label: "Streak",
          value: userData.stats.currentStreak,
          color: "text-orange-400",
          icon: "🔥",
          bg: "bg-orange-400/5",
        },
      ].map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeInUp}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
        >
          <Card
            className={`p-4 ${stat.bg} backdrop-blur-sm border-border/50 hover:border-border transition-all`}
          >
            <div className="text-2xl mb-1.5">{stat.icon}</div>
            <div className={`text-xl font-bold mb-0.5 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {stat.label}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
