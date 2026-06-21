"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("srt2prompt-theme");
    const nextLight = saved === "light";
    setLight(nextLight);
    document.documentElement.classList.toggle("theme-light", nextLight);
  }, []);

  function toggleTheme() {
    const nextLight = !light;
    setLight(nextLight);
    document.documentElement.classList.toggle("theme-light", nextLight);
    window.localStorage.setItem("srt2prompt-theme", nextLight ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Toggle theme"
      className="rounded-md border border-line p-2 text-muted hover:border-accent hover:text-white"
    >
      {light ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
