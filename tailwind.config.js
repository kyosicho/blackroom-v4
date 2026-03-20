export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "var(--primary, #ee2b5b)",
        "background-light": "var(--background-light, #f8f6f6)",
        "background-dark": "var(--background-dark, #1a0d10)",
        "card-dark": "var(--card-dark, #2a151a)",
        "border-dark": "#3d1f26",
        "surface-dark": "#331920",
        "input-dark": "#48232c",
        "accent-rose": "#c992a0",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
}
