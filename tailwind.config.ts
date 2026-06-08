import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[class~="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // theme-aware (über CSS-Vars)
        fg: "var(--text)",
        "fg-soft": "var(--text-soft)",
        "fg-mute": "var(--text-mute)",
        "fg-faint": "var(--text-faint)",
        page: "var(--bg)",
        surface: "var(--surface)",
        "surface-strong": "var(--surface-strong)",
        line: "var(--border)",
        "line-strong": "var(--border-strong)",

        // statisch (gleich in beiden Themes)
        shame: {
          DEFAULT: "#FF2D55",
          soft: "#FF6B86",
          deep: "#B30032",
          glow: "rgba(255, 45, 85, 0.45)",
        },
        gold: {
          DEFAULT: "#E8C36A",
          bright: "#FFD15C",
          deep: "#C99320",
          dark: "#7A5A18",
        },
        felt: {
          DEFAULT: "#1A6E48",
          dark: "#0E5C3F",
          soft: "#3DDC91",
        },
        mint: "#5FE3C4",
        sky: "#69A6FF",
        royal: "#C589FF",
        coral: "#FF8A3D",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        wheel: "var(--shadow-wheel)",
        pop: "var(--shadow-pop)",
      },
      animation: {
        "shimmer": "shimmer 2.4s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.4s ease-out forwards",
      },
      keyframes: {
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
