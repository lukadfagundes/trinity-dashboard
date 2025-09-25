/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'trinity-blue': '#1e40af',
        'trinity-green': '#10b981',
        'trinity-red': '#ef4444',
        'trinity-yellow': '#f59e0b',
        'trinity-dark': '#111827',
        'trinity-darker': '#0f172a',
        'trinity-light': '#f3f4f6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}