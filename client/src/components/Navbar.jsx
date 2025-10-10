import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Trophy, Gamepad2, Menu, X } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: Home, description: "Go to homepage" },
  { to: "/game", label: "Play", icon: Gamepad2, description: "Start playing" },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, description: "View rankings" },
  { to: "/profile", label: "Profile", icon: User, description: "Manage profile" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navbarVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      <motion.nav
        variants={navbarVariants}
        initial="initial"
        animate="animate"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/80 shadow-lg shadow-black/5"
            : "bg-background/80 backdrop-blur-md border-b border-border/50"
        }`}
      >
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            aria-label="Red Tetris Home"
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-shadow"
            >
              <span className="text-background">T</span>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                Red Tetris
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Classic Puzzle Game
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="relative group">
                  <motion.div
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10 shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-sm"
                    }`}
                    title={item.description}
                  >
                    <Icon className={`w-4 h-4 transition-transform ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`} />
                    <span>{item.label}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className="absolute left-4 right-4 -bottom-1 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <UserMenu />
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-10 w-10 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-16 left-4 right-4 bg-background/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl shadow-black/20 z-40 md:hidden overflow-hidden"
            >
              <div className="p-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navItems.map((item, index) => {
                    const isActive = pathname === item.to;
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { delay: index * 0.1 }
                        }}
                      >
                        <Link
                          to={item.to}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "text-primary bg-primary/10 shadow-md shadow-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                          <div>
                            <span className="font-medium">{item.label}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          {isActive && (
                            <motion.div
                              className="ml-auto w-2 h-2 bg-primary rounded-full"
                              layoutId="mobile-nav-indicator"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Mobile User Menu */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.4 }
                  }}
                  className="pt-4 border-t border-border/50"
                >
                  <UserMenu />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
