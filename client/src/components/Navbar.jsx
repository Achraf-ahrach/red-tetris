import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Gamepad2, Trophy, User, LogOut, Home } from "lucide-react";
import { useLogoutMutation } from "@/hooks/useAuthMutations";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

const navItems = [
  {
    to: "/profile",
    label: "Profile",
    icon: User,
    color: "from-blue-500 to-blue-600",
  },
  {
    to: "/game",
    label: "Play",
    icon: Gamepad2,
    color: "from-green-500 to-green-600",
  },
  {
    to: "/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    color: "from-yellow-500 to-yellow-600",
  },
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
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
      className="fixed left-0 top-0 bottom-0 z-50 w-20 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-r border-border/40 shadow-2xl"
      aria-label="Sidebar navigation"
    >
      <div className="relative h-full flex flex-col items-center py-6">
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mb-8"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col justify-center">
          <ul className="flex flex-col items-center gap-3">
            {navItems.map((item, index) => {
              const isActive = pathname === item.to;
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.to}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.3 + index * 0.1,
                  }}
                >
                  <div className="relative">
                    <Link
                      to={item.to}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex items-center justify-center h-14 w-14 rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        isActive
                          ? "bg-gradient-to-br " +
                            item.color +
                            " text-white shadow-lg scale-105"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/80 hover:scale-105"
                      }`}
                    >
                      {/* Animated background effect */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative z-10"
                      >
                        <Icon
                          className={`h-6 w-6 transition-all duration-200 ${
                            isActive ? "drop-shadow-md" : ""
                          }`}
                        />
                      </motion.div>

                      {/* Tooltip */}
                      <span className="pointer-events-none absolute left-full ml-4 whitespace-nowrap rounded-lg bg-popover px-3 py-2 text-sm font-medium text-popover-foreground opacity-0 shadow-xl border border-border/60 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 backdrop-blur-sm">
                        {item.label}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
                      </span>
                    </Link>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Decorative Tetris Blocks */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-4"
        >
          <div className="flex flex-col gap-1.5 p-2">
            {[
              { color: "bg-cyan-500", delay: 0 },
              { color: "bg-yellow-500", delay: 0.1 },
              { color: "bg-orange-500", delay: 0.2 },
            ].map((block, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.7 + block.delay,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                whileHover={{ scale: 1.3, rotate: 180 }}
                className={`w-3 h-3 ${block.color} rounded-sm shadow-lg cursor-pointer`}
              />
            ))}
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            aria-label="Logout"
            className="group relative flex items-center justify-center h-12 w-12 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
              <LogOut className="h-5 w-5" />
            </motion.div>

            {/* Logout Tooltip */}
            <span className="pointer-events-none   absolute left-full ml-4 whitespace-nowrap rounded-lg bg-popover px-3 py-2 text-sm font-medium text-popover-foreground opacity-0 shadow-xl border border-border/60 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 backdrop-blur-sm">
              Logout
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
