import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["Alt", "1"], description: "Go to Home" },
      { keys: ["Alt", "2"], description: "Go to Game" },
      { keys: ["Alt", "3"], description: "Go to Leaderboard" },
      { keys: ["Alt", "4"], description: "Go to Profile" },
      { keys: ["Alt", "D"], description: "Toggle Navigation Dock (Desktop)" },
    ]
  },
  {
    category: "General",
    items: [
      { keys: ["?"], description: "Show/Hide this help" },
      { keys: ["Esc"], description: "Close modals and menus" },
      { keys: ["Tab"], description: "Navigate between elements" },
    ]
  }
];

const KeyboardShortcut = ({ keys }) => {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <kbd className="inline-flex items-center px-2 py-1 text-xs font-medium text-foreground bg-muted border border-border rounded shadow-sm">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  );
};

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-background border border-border rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
                {shortcuts.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.items.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-foreground">
                            {shortcut.description}
                          </span>
                          <KeyboardShortcut keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-border bg-muted/50">
                <p className="text-xs text-muted-foreground text-center">
                  Press <kbd className="px-1 py-0.5 text-xs bg-background border rounded">?</kbd> to toggle this help
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const KeyboardShortcutsProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Show help with ? key
      if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        // Don't trigger if user is typing in an input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
          return;
        }
        event.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Close with Escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {children}
      <KeyboardShortcutsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
