"use client";

import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useSound } from "@/lib/sound";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="segmented grid grid-cols-2 w-full max-w-[260px]">
      <button
        onClick={() => setTheme("dark")}
        data-active={theme === "dark"}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <Moon size={14} /> Dunkel
      </button>
      <button
        onClick={() => setTheme("light")}
        data-active={theme === "light"}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <Sun size={14} /> Hell
      </button>
    </div>
  );
}

export function SoundToggle() {
  const { muted, setMuted } = useSound();
  return (
    <div className="segmented grid grid-cols-2 w-full max-w-[260px]">
      <button
        onClick={() => setMuted(false)}
        data-active={!muted}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <Volume2 size={14} /> An
      </button>
      <button
        onClick={() => setMuted(true)}
        data-active={muted}
        className="segmented-btn inline-flex items-center justify-center gap-2 py-2"
      >
        <VolumeX size={14} /> Aus
      </button>
    </div>
  );
}
