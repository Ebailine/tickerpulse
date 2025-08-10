/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { typography: { DEFAULT: { css: { maxWidth: "65ch" }}}}},
  plugins: []
};
