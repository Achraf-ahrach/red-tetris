import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Trophy, User, LogOut, X, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/hooks/useAuthMutations";

const menuItems = [
  { to: "/game", label: "Play", icon: Gamepad2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

const Backdrop = ({ onClick }) => (
  <motion.div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
  />
);

export const FloatingMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutMutation = useLogoutMutation();

  const toggle = () => setOpen((o) => !o);

  const onLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setOpen(false);
      navigate("/login");
    } catch {
      setOpen(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "m") toggle();
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AnimatePresence>
        {open && <Backdrop onClick={() => setOpen(false)} />}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {open && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mb-3 w-[90vw] max-w-sm rounded-2xl border bg-background/80 backdrop-blur-xl shadow-2xl shadow-primary/10"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    Quick Actions
                  </div>
                  <button
                    aria-label="Close Menu"
                    className="p-2 rounded-md hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {menuItems.map(({ to, label, icon: Icon }) => (
                    <motion.button
                      key={to}
                      onClick={() => {
                        navigate(to);
                        setOpen(false);
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="aspect-square rounded-xl border bg-card hover:bg-accent/30 flex flex-col items-center justify-center gap-2"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </motion.button>
                  ))}
                  <motion.button
                    onClick={onLogout}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="aspect-square rounded-xl border bg-destructive/10 text-destructive hover:bg-destructive/20 flex flex-col items-center justify-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-xs font-medium">Logout</span>
                  </motion.button>
                </div>
                {user && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    Press <kbd className="px-1 py-0.5 bg-muted rounded">M</kbd>{" "}
                    to toggle menu
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          aria-label="Open Menu"
          onClick={toggle}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full shadow-lg shadow-primary/20 border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};

export default FloatingMenu;
