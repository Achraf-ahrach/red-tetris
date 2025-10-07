import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Clock } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export default function PerformanceCards({ stats, variants }) {
  const items = [
    {
      label: "High Score",
      value: stats.highScore.toLocaleString(),
      icon: Trophy,
    },
    {
      label: "Total Lines",
      value: stats.totalLines.toLocaleString(),
      icon: Target,
    },
    { label: "Play Time", value: stats.playTime, icon: Clock },
  ];

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      className="mb-16"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-muted-foreground" />
        Performance
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {items.map((stat) => (
          <motion.div key={stat.label} variants={fadeIn}>
            <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-colors">
              <div className="flex items-start justify-between mb-3">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
