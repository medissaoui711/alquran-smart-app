/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stone: {
          850: '#1c1917',
          900: '#0c0a09',
        }
      },
      screens: {
        'xs': '480px',
        '3xl': '1600px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        serif: ['Amiri', 'serif'],
        amiri: ['Amiri', 'serif'],
        lateef: ['Lateef', 'serif'],
        scheherazade: ['Scheherazade New', 'serif'],
      }
    },
  },
  plugins: [],
}