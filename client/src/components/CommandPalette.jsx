import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Trophy, User, LogOut, Search } from "lucide-react";
import { useLogoutMutation } from "@/hooks/useAuthMutations";

const commands = [
  {
    id: "play",
    label: "Play Tetris",
    to: "/game",
    icon: Gamepad2,
    keywords: ["start", "game", "play"],
  },
  {
    id: "leaderboard",
    label: "Open Leaderboard",
    to: "/leaderboard",
    icon: Trophy,
    keywords: ["rank", "scores", "top"],
  },
  {
    id: "profile",
    label: "View Profile",
    to: "/profile",
    icon: User,
    keywords: ["account", "user", "settings"],
  },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const logoutMutation = useLogoutMutation();

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [
      ...commands,
      {
        id: "logout",
        label: "Logout",
        to: null,
        icon: LogOut,
        keywords: ["exit", "sign out"],
      },
    ];
    if (!q) return base;
    return base.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords?.some((k) => k.includes(q))
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = async (e) => {
      if (e.key === "Escape") return onClose?.();
      if (e.key === "ArrowDown")
        return setActive((i) => Math.min(i + 1, items.length - 1));
      if (e.key === "ArrowUp") return setActive((i) => Math.max(i - 1, 0));
      if (e.key === "Enter") {
        const item = items[active];
        if (!item) return;
        if (item.id === "logout") {
          await logoutMutation.mutateAsync();
          onClose?.();
          return navigate("/login");
        }
        if (item.to) navigate(item.to);
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, navigate, logoutMutation, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed z-50 left-1/2 top-24 w-[92vw] max-w-xl -translate-x-1/2"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="rounded-2xl border bg-background/90 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search actions… (Press ⌘K / Ctrl+K)"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              <ul className="max-h-80 overflow-auto py-1">
                {items.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = idx === active;
                  return (
                    <li key={item.id}>
                      <button
                        onMouseEnter={() => setActive(idx)}
                        onClick={async () => {
                          if (item.id === "logout") {
                            await logoutMutation.mutateAsync();
                            onClose?.();
                            return navigate("/login");
                          }
                          if (item.to) navigate(item.to);
                          onClose?.();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive ? "bg-accent/60" : "hover:bg-accent/40"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
                {items.length === 0 && (
                  <li className="px-4 py-6 text-sm text-muted-foreground">
                    No results
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
