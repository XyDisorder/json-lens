/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f172a",
          raised: "#1e293b",
        },
        accent: {
          green: "#34d399",
          blue: "#60a5fa",
        },
      },
      boxShadow: {
        glow: "0 20px 60px rgba(15, 23, 42, 0.6)",
      },
    },
  },
  plugins: [],
};
