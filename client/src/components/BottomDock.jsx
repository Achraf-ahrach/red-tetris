import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Trophy, User, Home } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/game", label: "Play", icon: Gamepad2 },
  { to: "/leaderboard", label: "Top", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomDock() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50"
      onMouseLeave={() => setOpen(false)}
    >
      {/* Hover zone (slightly taller for comfort) */}
      <div className="w-full h-4" onMouseEnter={() => setOpen(true)} />

      <AnimatePresence>
        {open && (
          <motion.div
            key="dock"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="mx-auto mb-6 w-max max-w-[95vw] rounded-2xl border bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/15 px-2 py-2"
            onMouseEnter={() => setOpen(true)}
          >
            <div className="flex items-center gap-1">
              {items.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <button
                    key={to}
                    onClick={() => navigate(to)}
                    title={label}
                    className={`group relative inline-flex items-center justify-center w-14 h-14 rounded-xl transition-colors ${
                      active
                        ? "text-foreground bg-accent/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    {/* Active indicator */}
                    {active && (
                      <motion.span
                        layoutId="dock-active"
                        className="absolute -bottom-1 h-1 w-8 rounded-full bg-primary"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 30,
                        }}
                      />
                    )}
                    {/* Tooltip label */}
                    <span className="pointer-events-none absolute -top-7 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow border">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile persistent safe area spacer */}
      <div className="h-6 md:h-2" />
    </div>
  );
}
