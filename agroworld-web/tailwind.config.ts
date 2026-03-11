import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        agro: {
          50:  "#e8f4f5", 100: "#c5e4e6", 200: "#9acfd3",
          300: "#6ab8bf", 400: "#2a9d8f", 500: "#1a6b5e",
          600: "#0d4a3e", 700: "#0d2b33", 800: "#091e25", 900: "#050f12",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease-out forwards",
        "fade-in":    "fadeIn 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:  { "0%": { opacity:"0", transform:"translateY(24px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
        fadeIn:  { "0%": { opacity:"0" }, "100%": { opacity:"1" } },
      },
    },
  },
  plugins: [],
};
export default config;
