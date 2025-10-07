import React from "react";
import { motion } from "framer-motion";
import ProfileHeader from "../../components/profile/ProfileHeader";
import StatsGrid from "../../components/profile/StatsGrid";
import PerformanceCards from "../../components/profile/PerformanceCards";
import AchievementsGrid from "../../components/profile/AchievementsGrid";
import RecentMatches from "../../components/profile/RecentMatches";

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Mock user data
const userData = {
  name: "Alex Chen",
  username: "tetris_master",
  avatar: "/gamer-avatar.png",
  level: 42,
  xp: 7850,
  xpToNextLevel: 10000,
  rank: "Diamond",
  joinDate: "Jan 2024",
  stats: {
    totalGames: 1247,
    wins: 892,
    highScore: 125840,
    avgScore: 45230,
    totalLines: 15420,
    playTime: "156h",
    winRate: 71.5,
    currentStreak: 12,
  },
  achievements: [
    {
      id: 1,
      name: "Speed Demon",
      icon: "⚡",
      unlocked: true,
      rarity: "legendary",
    },
    {
      id: 2,
      name: "Perfect Clear",
      icon: "🎯",
      unlocked: true,
      rarity: "epic",
    },
    {
      id: 3,
      name: "Marathon Master",
      icon: "🏃",
      unlocked: true,
      rarity: "rare",
    },
    {
      id: 4,
      name: "Combo King",
      icon: "🔥",
      unlocked: false,
      rarity: "legendary",
    },
    {
      id: 5,
      name: "Line Clearer",
      icon: "✨",
      unlocked: true,
      rarity: "common",
    },
    {
      id: 6,
      name: "Tetris God",
      icon: "👑",
      unlocked: false,
      rarity: "mythic",
    },
  ],
  recentGames: [
    {
      id: 1,
      mode: "Classic",
      score: 89450,
      lines: 142,
      result: "win",
      rank: "#12",
      date: "2h ago",
      opponentName: "Nova Byte",
    },
    {
      id: 2,
      mode: "Sprint",
      score: 45230,
      lines: 40,
      result: "win",
      rank: "#5",
      date: "5h ago",
      opponentName: "Pixel Pro",
    },
    {
      id: 3,
      mode: "Battle",
      score: 67890,
      lines: 98,
      result: "loss",
      rank: "#23",
      date: "1d ago",
      opponentName: "Stack Storm",
    },
    {
      id: 4,
      mode: "Classic",
      score: 125840,
      lines: 203,
      result: "win",
      rank: "#3",
      date: "2d ago",
      opponentName: "Block Boss",
    },
    {
      id: 5,
      mode: "Marathon",
      score: 98760,
      lines: 156,
      result: "win",
      rank: "#8",
      date: "3d ago",
      opponentName: "Tetrix AI",
    },
  ],
};

const Profile = () => {
  return (
    <>
      {/* Subtle background grid overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="pl-16 relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 pb-6 border-b border-border/40"
          >
            <ProfileHeader user={userData} />
            <StatsGrid
              stats={userData.stats}
              variants={stagger}
              userData={userData}
            />
          </motion.div>
          <AchievementsGrid userData={userData} />
          <RecentMatches userData={userData} variants={stagger} />
        </div>
      </div>
    </>
  );
};

export default Profile;
