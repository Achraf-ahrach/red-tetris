import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Gamepad2, Trophy, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/hooks/useAuthMutations";
import { motion } from "framer-motion";

const navItems = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/game", label: "Play", icon: Gamepad2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/login");
    } catch (e) {
      navigate("/login");
    }
  };

  return (
    <motion.nav
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="fixed left-0 top-0 bottom-0 z-50 w-16 md:w-20 bg-background/90 backdrop-blur border-r border-border/60 shadow-sm"
      aria-label="Sidebar navigation"
    >
      <div className="relative h-full flex flex-col items-center">
        {/* Centered page links */}
        <div className="flex-1" />
        <ul className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <div className="relative">
                  {/* Active indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <Link
                    to={item.to}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    title={item.label}
                    className={`group relative flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      isActive
                        ? "text-primary bg-primary/10 shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 md:h-6 md:w-6 transition-transform ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    {/* Hover tooltip */}
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md border border-border/60 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 will-change-transform">
                      {item.label}
                    </span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex-1" />

        {/* Logout pinned at bottom */}
        <div
          style={{
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 1rem)",
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            title="Log out"
            className="h-12 w-12 md:h-14 md:w-14 text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <motion.span
              initial={false}
              animate={{
                rotate: logoutMutation.isPending ? 90 : 0,
                opacity: 1,
              }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <LogOut className="h-5 w-5 md:h-6 md:w-6" />
            </motion.span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
