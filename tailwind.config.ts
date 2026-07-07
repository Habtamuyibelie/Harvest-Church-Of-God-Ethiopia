import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Logo palette: red flame, gold ring, blue cross — theme-aware via CSS
        // variables so every page automatically adapts between dark and light mode.
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        inkLight: "rgb(var(--c-inkLight) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        surfaceUp: "rgb(var(--c-surfaceUp) / <alpha-value>)",
        rim: "rgb(var(--c-rim) / <alpha-value>)",
        hairline: "rgb(var(--c-hairline) / <alpha-value>)",
        parchment: "rgb(var(--c-parchment) / <alpha-value>)",
        parchmentDim: "rgb(var(--c-parchmentDim) / <alpha-value>)",
        charcoal: "#231F1A",
        red: "#C32A2E",
        redDark: "#8E1D20",
        gold: "rgb(var(--c-gold) / <alpha-value>)",
        goldDim: "rgb(var(--c-goldDim) / <alpha-value>)",
        green: "#1E6B3C",
        greenDark: "#143F25",
        blue: "#1B3F8B",
        blueDark: "#122A5E",
        // legacy aliases used by older pages
        terracotta: "#C32A2E",
        terracottaDark: "#8E1D20",
        forest: "#1E6B3C",
        forestDark: "#143F25",
        parchmentDark: "#141720",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-source)", "sans-serif"],
      },
      backgroundImage: {
        weave:
          "repeating-linear-gradient(135deg, rgba(181,83,44,0.08) 0px, rgba(181,83,44,0.08) 2px, transparent 2px, transparent 10px)",
      },
    },
  },
  plugins: [],
};
export default config;
