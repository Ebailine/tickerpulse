/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 25px -10px rgba(0,0,0,0.25)",
      },
      colors: {
        brand: {
          900: "#0b1220",
          700: "#111827",
        }
      },
      typography: { DEFAULT: { css: { maxWidth: "65ch" }}}
    }
  },
  plugins: []
};
