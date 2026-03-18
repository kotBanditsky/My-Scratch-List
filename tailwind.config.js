module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        "bg-primary": "#09090B",
        "bg-card": "rgba(255,255,255,0.03)",
        "bg-glass": "rgba(255,255,255,0.06)",
        "bg-glass-hover": "rgba(255,255,255,0.1)",
        accent: "#8B5CF6",
        "accent-light": "#A78BFA",
        "accent-dim": "rgba(139,92,246,0.15)",
        "text-primary": "#FAFAFA",
        "text-secondary": "#A1A1AA",
        "text-muted": "#52525B",
        border: "rgba(255,255,255,0.06)",
        "border-glow": "rgba(139,92,246,0.3)",
        success: "#22C55E",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(139,92,246,0.15)",
        "glow-lg": "0 0 40px rgba(139,92,246,0.2)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
