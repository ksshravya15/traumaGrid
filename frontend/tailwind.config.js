/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trauma: {
          dark: "#0a0f1d",
          panel: "#111827",
          card: "#1f2937",
          border: "#374151",
          red: "#ef4444",
          redGlow: "rgba(239, 68, 68, 0.25)",
          yellow: "#f59e0b",
          yellowGlow: "rgba(245, 158, 11, 0.25)",
          green: "#10b981",
          greenGlow: "rgba(16, 185, 129, 0.25)",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 2s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
}
