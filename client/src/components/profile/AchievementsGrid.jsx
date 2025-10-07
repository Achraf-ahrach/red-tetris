import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

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

export default function AchievementsGrid({ achievements, userData, variants }) {
  const items = achievements ?? userData?.achievements ?? [];
  return (
    <motion.div
      variants={variants || staggerContainer}
      initial="initial"
      animate="animate"
      className="mb-10"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-muted-foreground " />
        Achievements
      </h2>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {items.map((achievement) => {
          const description =
            achievement.description ||
            achievement.hint ||
            "Unlock this by completing its challenge.";
          return (
            <motion.div
              key={achievement.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 360, damping: 18 }}
            >
              <Card
                className={`group relative p-4 text-center ${
                  achievement.unlocked
                    ? "bg-card/60 backdrop-blur-sm border-primary/30 shadow shadow-primary/10"
                    : "bg-card/30 backdrop-blur-sm border-muted/30 opacity-60"
                } hover:border-primary transition-all`}
                title={description}
              >
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <div className="text-xs font-semibold mb-1 line-clamp-1">
                  {achievement.name}
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] h-4 px-1.5 ${
                    achievement.rarity === "mythic"
                      ? "border-purple-500 text-purple-400 bg-purple-500/10"
                      : achievement.rarity === "legendary"
                      ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                      : achievement.rarity === "epic"
                      ? "border-pink-500 text-pink-400 bg-pink-500/10"
                      : achievement.rarity === "rare"
                      ? "border-blue-500 text-blue-400 bg-blue-500/10"
                      : "border-gray-500 text-gray-400 bg-gray-500/10"
                  }`}
                >
                  {achievement.rarity}
                </Badge>

                {/* Hover tooltip panel */}
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 rounded-md border bg-popover text-popover-foreground text-xs p-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow">
                  {description}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
