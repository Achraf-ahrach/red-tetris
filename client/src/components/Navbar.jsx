import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, User, Trophy, Gamepad2 } from "lucide-react";
import UserMenu from "@/components/UserMenu";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/game", label: "Play", icon: Gamepad2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 px-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          aria-label="Red Tetris Home"
          className="flex items-center gap-2"
        >
          <motion.div
            whileHover={{ scale: 1.06, rotate: 2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20"
          >
            T
          </motion.div>
          <span className="font-semibold hidden sm:inline">Red Tetris</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="relative group">
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-[2px] h-[2px] bg-primary rounded"
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
