/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        'trinity-dark-bg': '#0f172a',
        'trinity-dark-card': '#1e293b',
        'trinity-dark-text': '#e2e8f0',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}