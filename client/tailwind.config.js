/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#15934e",
          dark: "#107d42",
          darker: "#0b5c31",
          tint: "#e9f6ef",
          edge: "#b8dec7",
        },
        line: "#e4e7ec",
        "line-strong": "#cfd6df",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};