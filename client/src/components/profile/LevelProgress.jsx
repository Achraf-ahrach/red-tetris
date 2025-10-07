import React from "react";
import { Progress } from "@/components/ui/progress";

export default function LevelProgress({ xp, xpToNextLevel }) {
  const value = (xp / xpToNextLevel) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Level Progress</span>
        <span className="text-xs text-muted-foreground font-mono">
          {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
        </span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
