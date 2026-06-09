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
        // Champagner-Gold — edler, wärmer, weniger „Neon-Gelb"
        gold: {
          DEFAULT: "#E8CE92",
          bright: "#FBE7B0",
          deep: "#C39A40",
          dark: "#7A5A18",
        },
        // Smaragd-Felt — satter Spieltisch
        felt: {
          DEFAULT: "#178A56",
          dark: "#0C5C3C",
          deep: "#082A1B",
          soft: "#3DDC91",
        },
        // Graphit — die „gräulichen" Panels
        graphite: {
          DEFAULT: "#2A332F",
          soft: "#3A453F",
          deep: "#1C2421",
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
        gold: "var(--shadow-gold)",
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.4s ease-out forwards",
        sheen: "sheen 3.2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        twinkle: "twinkle 2.6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        sheen: {
          "0%": { transform: "translateX(-130%) skewX(-18deg)" },
          "60%, 100%": { transform: "translateX(230%) skewX(-18deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.15", transform: "scale(0.6)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
