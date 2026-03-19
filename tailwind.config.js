export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#ee2b5b",
        "background-light": "#f8f6f6",
        "background-dark": "#1a0d10",
        "card-dark": "#2a151a",
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
