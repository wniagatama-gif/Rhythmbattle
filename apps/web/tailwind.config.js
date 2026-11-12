/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        stage: {
          bg: "#111318",
          panel: "#181B22",
          elevated: "#20242E",
          border: "#64748B",
          muted: "#A8B0BF",
          accent: "#BE123C",
          accentHover: "#9F1239",
          accentRing: "#F43F5E"
        }
      }
    }
  },
  plugins: []
};
