import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main, #ffffff)",
        void: "var(--bg-void, #ffffff)",
        surface: {
          DEFAULT: "var(--bg-main, #ffffff)",
          low: "var(--bg-surface-low, #ffffff)",
          card: "var(--bg-surface-card, #ffffff)",
          high: "var(--bg-surface-high, #f8fafc)",
          highest: "var(--bg-surface-highest, #f1f5f9)",
          bright: "var(--bg-surface-high, #f8fafc)"
        },
        aura: {
          purple: "#8e2de2",
          violet: "#4b05e2",
          neon: "#7c3aed",
          secondary: "#cabeff",
          amber: "#f59e0b",
          error: "#ef4444",
          errorBg: "#dc2626"
        },
        content: {
          DEFAULT: "var(--text-main, #0f172a)",
          muted: "var(--text-muted, #334155)",
          subtle: "var(--text-subtle, #64748b)"
        },
        stroke: {
          subtle: "var(--stroke-subtle, #e2e8f0)",
          glass: "var(--stroke-glass, #cbd5e1)",
          border: "var(--stroke-glass, #cbd5e1)"
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        'pill': '9999px'
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(142, 45, 226, 0.35)',
        'glow-lg': '0 0 35px -5px rgba(142, 45, 226, 0.45)',
        'glow-amber': '0 0 25px -5px rgba(255, 184, 114, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
