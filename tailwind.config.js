/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode based on class
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4a8eff',
          DEFAULT: '#1a73e8',
          dark: '#0d47a1',
        },
        secondary: {
          light: '#f8faff',
          DEFAULT: '#ffffff',
          dark: '#f1f5fe',
        },
      },
    },
  },
  plugins: [],
} 