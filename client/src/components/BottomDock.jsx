import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Trophy, User, Home, ChevronUp } from "lucide-react";

const navigationItems = [
  {
    to: "/",
    label: "Home",
    icon: Home,
    description: "Return to homepage",
  },
  {
    to: "/game",
    label: "Play",
    icon: Gamepad2,
    description: "Start a new game",
  },
  {
    to: "/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    description: "View top players",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: User,
    description: "Manage your account",
  },
];

const BottomDock = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-expand on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(true);
      const timer = setTimeout(() => setIsExpanded(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [pathname, isMobile]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Alt + Number keys for quick navigation
      if (event.altKey && !event.ctrlKey && !event.shiftKey) {
        const keyNum = parseInt(event.key);
        if (keyNum >= 1 && keyNum <= navigationItems.length) {
          event.preventDefault();
          navigate(navigationItems[keyNum - 1].to);
        }
      }

      // Alt + D to toggle dock on desktop
      if (event.altKey && event.key.toLowerCase() === "d" && !isMobile) {
        event.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, isMobile]);

  const handleNavigation = (to) => {
    navigate(to);
    if (isMobile) {
      setIsExpanded(true);
      setTimeout(() => setIsExpanded(false), 1500);
    }
  };

  const dockVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  };

  return (
    <>
      {/* Desktop: Hover-activated dock */}
      {!isMobile && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 pointer-events-none"
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* Invisible hover trigger zone */}
          <div
            className="w-full h-8 pointer-events-auto"
            onMouseEnter={() => setIsExpanded(true)}
          />

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={dockVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="pointer-events-auto mx-auto mb-8 w-max max-w-[90vw]"
                onMouseEnter={() => setIsExpanded(true)}
              >
                <div className="relative">
                  {/* Glass morphism background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-2xl shadow-black/25" />

                  {/* Content */}
                  <div className="relative flex items-center gap-2 px-4 py-3">
                    {navigationItems.map(
                      ({ to, label, icon: Icon, description }) => {
                        const isActive = pathname === to;
                        return (
                          <motion.button
                            key={to}
                            variants={itemVariants}
                            onClick={() => handleNavigation(to)}
                            className={`group relative inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                              isActive
                                ? "text-primary bg-primary/10 shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-md"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={description}
                          >
                            <Icon
                              className={`w-5 h-5 transition-transform ${
                                isActive ? "scale-110" : "group-hover:scale-105"
                              }`}
                            />

                            {/* Active indicator */}
                            {isActive && (
                              <motion.div
                                layoutId="desktop-dock-active"
                                className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-primary"
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                              />
                            )}

                            {/* Enhanced tooltip */}
                            <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-popover text-popover-foreground text-sm px-3 py-2 rounded-lg shadow-lg border backdrop-blur-sm whitespace-nowrap">
                              <span className="font-medium">{label}</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
                            </div>
                          </motion.button>
                        );
                      }
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile: Always visible dock */}
      {isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="relative">
            {/* Glass morphism background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl border-t border-border/50" />

            {/* Content */}
            <div className="relative flex items-center justify-around px-4 py-3 safe-area-bottom">
              {navigationItems.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to;
                return (
                  <motion.button
                    key={to}
                    onClick={() => handleNavigation(to)}
                    className={`group relative inline-flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    aria-label={label}
                  >
                    <motion.div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg mb-1 ${
                        isActive
                          ? "bg-primary/10 shadow-lg shadow-primary/20"
                          : "group-hover:bg-accent/40"
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform ${
                          isActive ? "scale-110" : ""
                        }`}
                      />
                    </motion.div>

                    <span
                      className={`text-xs font-medium transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="mobile-dock-active"
                        className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-primary"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Safe area spacing */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      )}
    </>
  );
};

export default BottomDock;
