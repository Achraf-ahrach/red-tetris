import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Trophy, Gamepad2, LogOut } from "lucide-react";
import { useLogoutMutation } from "@/hooks/useAuthMutations";
import { Button } from "@/components/ui/button";

// Only icons; removed Home item per request
const navItems = [
  { to: "/game", label: "Play", icon: Gamepad2, description: "Start playing" },
  {
    to: "/leaderboard",
    label: "Top",
    icon: Trophy,
    description: "View rankings",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: User,
    description: "Manage profile",
  },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const logoutMutation = useLogoutMutation();

  const isActive = useMemo(() => (to) => pathname === to, [pathname]);

  const containerVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.98 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 26,
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 28 },
    },
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Redirect handled by logout hook (window.location.replace)
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Primary"
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
    >
      {/* Rail */}
      <div className="relative rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/20">
        {/* Inner */}
        <div className="flex flex-col items-center p-2 gap-1">
          {navItems.map(({ to, label, icon: Icon, description }) => (
            <motion.div key={to} variants={itemVariants}>
              <Link
                to={to}
                title={description}
                className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                  isActive(to)
                    ? "text-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
                aria-current={isActive(to) ? "page" : undefined}
              >
                {/* Active indicator */}
                {isActive(to) && (
                  <motion.span
                    layoutId="left-rail-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 ${
                    isActive(to) ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                <span className="sr-only">{label}</span>
              </Link>
            </motion.div>
          ))}

          {/* Divider */}
          <div className="my-1 h-px bg-border/60 w-full" />

          {/* Logout at bottom */}
          <motion.div variants={itemVariants} className="mt-1">
            <Button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              title="Log out"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-destructive/10"
              variant="ghost"
            >
              <LogOut className="w-5 h-5" />
              <span className="sr-only">
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
