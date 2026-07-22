/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C89B00',
        secondary: '#D0B67A',
        'primary-dark': '#9C7F00',
        background: '#C8C4A6',
      },
    },
  },
  plugins: [],
}