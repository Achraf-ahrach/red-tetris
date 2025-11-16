import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ProfileHeader from "../../components/profile/ProfileHeader";
import StatsGrid from "../../components/profile/StatsGrid";
import StatsByMode from "../../components/profile/StatsByMode";
import AchievementsGrid from "../../components/profile/AchievementsGrid";
import RecentMatches from "../../components/profile/RecentMatches";
import { userAPI } from "../../services/api";
import { getUserAchievementsWithDetails } from "../../constants/achievements";
import { getAvatarUrl } from "../../lib/utils";

const Profile = () => {
  const {
    data: userData,
    isLoading: loading,
    isError,
    error,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["me", "profile"],
    queryFn: async () => {
      const res = await userAPI.getCurrentUserProfile();
      if (res?.error || res?.success === false) {
        throw new Error(res?.data?.message || "Failed to load profile");
      }
      return res;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    select: (response) => {
      if (!response?.success) return null;
      const profileData = response.data;

      return {
        id: profileData.id,
        name:
          `${profileData.firstName || ""} ${
            profileData.lastName || ""
          }`.trim() || profileData.username,
        username: profileData.username,
        avatar: profileData.avatar || "/gamer-avatar.png",
        level: profileData.stats.level,
        xp: profileData.stats.experience,
        xpToNextLevel: profileData.stats.expToNextLevel,
        is42User: profileData.is42User,
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

        statsByMode: profileData.statsByMode,
        achievements: getUserAchievementsWithDetails(profileData.achievements),
        performance: profileData.performance,
        recentGames: [],
      };
    },
  });

  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ["me", "history", userData?.id],
    enabled: !!userData?.id,
    queryFn: async () => {
      const resMe = await userAPI.getCurrentUser();
      const userId = resMe?.data?.id;
      if (!userId) throw new Error("Missing user id");
      const res = await userAPI.getUserHistory(userId, { limit: 10 });
      if (res?.error)
        throw new Error(res?.data?.message || "Failed to load history");
      return res?.data ?? [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Format game mode for display
  const formatGameMode = (mode) => {
    const modes = {
      classic: "Classic",
      ranked: "Ranked",
      multiplayer: "Multiplayer",
      survival: "Survival",
    };
    return modes[mode] || "Classic";
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const recentGames = (historyData || []).map((g) => ({
    id: g.id,
    mode: formatGameMode(g.gameMode),
    score: g.score || 0,
    lines: g.lines || 0,
    date: formatDate(g.createdAt),
    result: g.result || "loss",
    rank: g.level ? `Lv ${g.level}` : "-",
    opponent: g.opponentName
      ? {
          name: g.opponentName,
          avatar: getAvatarUrl(g.opponentAvatar),
        }
      : null,
    opponentName: g.opponentName || null,
    duration: g.duration,
    roomName: g.roomName,
  }));

  if (loading) {
    return (
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl">
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
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl">
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
      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl">
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

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border/40"
          >
            <ProfileHeader user={userData} />
            <StatsGrid userData={userData} />
          </motion.div>

          {/* Game Modes Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Game Modes</h2>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Performance by mode
              </span>
            </div>
            <StatsByMode statsByMode={userData.statsByMode} showTitle={false} />
          </motion.div>

          <AchievementsGrid userData={userData} />
          {recentGames && recentGames?.length > 0 ? (
            <div className="mt-6 sm:mt-8">
              <RecentMatches userData={{ recentGames }} />
            </div>
          ) : (
            <div className="mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                Recent Matches
              </h2>
              <div className="text-center py-12 bg-card/30 backdrop-blur-sm border border-border/40 rounded-lg">
                <p className="text-muted-foreground mb-2">
                  No game history yet
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Play some games to see your history here!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
