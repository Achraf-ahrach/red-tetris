import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
};

export default function ThemeSwitcher({ className = "" }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${className}`}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
