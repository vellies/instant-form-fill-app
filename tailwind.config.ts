import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: "#ffffff",
        "surface-muted": "#f3f7f5",
        primary: "#3fc98a",
        "primary-dark": "#239966",
        "primary-light": "#e3f9ed",
        ink: "#10202f",
        "ink-soft": "#4b5768",
        "ink-muted": "#8b96a5",
        border: "#e8edf1",
        danger: "#e0554f",
        "danger-light": "#fbe9e8",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 16px 36px rgba(16, 32, 48, 0.08)",
      },
      backgroundImage: {
        "app-gradient": "linear-gradient(160deg, #dde8f6, #e3f6ec)",
      },
    },
  },
  plugins: [],
} satisfies Config;
