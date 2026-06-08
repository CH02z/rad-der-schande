import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#07060B",
          900: "#0B0912",
          800: "#11101A",
          700: "#1A1825",
          600: "#252233",
          500: "#3A3650",
        },
        shame: {
          DEFAULT: "#FF2D55",
          soft: "#FF6B86",
          deep: "#B30032",
          glow: "rgba(255, 45, 85, 0.45)",
        },
        gold: {
          DEFAULT: "#FFD15C",
          deep: "#C99320",
        },
        mint: "#5FE3C4",
        sky: "#69A6FF",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.4)",
        wheel: "0 30px 80px -10px rgba(255,45,85,0.25), 0 0 0 1px rgba(255,255,255,0.06) inset",
        hub: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08) inset",
        pop: "0 20px 60px -10px rgba(255,45,85,0.4)",
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
      },
      animation: {
        "pulse-shame": "pulse-shame 2s ease-in-out infinite",
        "shimmer": "shimmer 2.4s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-shame": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,45,85,0.45)" },
          "50%": { boxShadow: "0 0 0 24px rgba(255,45,85,0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
