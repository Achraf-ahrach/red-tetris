import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ProfileHeader from "../../components/profile/ProfileHeader";
import StatsGrid from "../../components/profile/StatsGrid";
import PerformanceCards from "../../components/profile/PerformanceCards";
import AchievementsGrid from "../../components/profile/AchievementsGrid";
import RecentMatches from "../../components/profile/RecentMatches";
import { userAPI } from "../../services/api";
import { getUserAchievementsWithDetails } from "../../constants/achievements";

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const Profile = () => {
  const {
    data: userData,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: async () => {
      const res = await userAPI.getCurrentUserProfile();
      if (res?.error || res?.success === false) {
        throw new Error(res?.data?.message || "Failed to load profile");
      }
      return res;
    },
    select: (response) => {
      if (!response?.success) return null;
      const profileData = response.data;

      return {
        name:
          `${profileData.firstName || ""} ${
            profileData.lastName || ""
          }`.trim() || profileData.username,
        username: profileData.username,
        avatar: profileData.avatar || "/gamer-avatar.png",
        level: profileData.stats.level,
        xp: profileData.stats.experience,
        xpToNextLevel: profileData.stats.expToNextLevel,
        rank: profileData.performance.skillLevel,
        joinDate: new Date(profileData.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),

        stats: {
          totalGames: profileData.stats.totalGames,
          wins: profileData.stats.totalWins,
          highScore: profileData.stats.highScore,
          avgScore: Math.round(profileData.stats.highScore * 0.6),
          totalLines: profileData.stats.totalLines,
          playTime: profileData.stats.playTimeFormatted,
          winRate: profileData.stats.winRate,
          currentStreak: profileData.stats.currentStreak,
        },

        // Transform achievements using our enum
        achievements: getUserAchievementsWithDetails(profileData.achievements),

        // Performance data
        performance: profileData.performance,

        // No recent games since game sessions were removed
        recentGames: [],
      };
    },
  });

  if (loading) {
    return (
      <div className="pl-16 relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">
              Loading profile...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pl-16 relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load profile</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Unknown error"}
              </p>
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

  if (!userData) {
    return (
      <div className="pl-16 relative z-10">
        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No profile data available</p>
          </div>
        </div>
      </div>
    );
  }

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
          {/* <RecentMatches userData={userData} variants={stagger} /> */}
        </div>
      </div>
    </>
  );
};

export default Profile;
