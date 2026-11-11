/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0b0f19",
          card: "#121826",
          accent: "#6366f1",
          neon: "#06b6d4"
        }
      }
    }
  },
  plugins: []
};

