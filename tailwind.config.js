/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#edf5f0',
          100: '#c8e0d1',
          200: '#a2cbaf',
          300: '#6fad85',
          400: '#4d9066',
          500: '#1a4d3e',
          600: '#163e32',
          700: '#112f26',
          800: '#0d201a',
          900: '#08120e',
        },
        sand: {
          50: '#fdf8f0',
          100: '#f7edd9',
          200: '#edd6b0',
          300: '#e2bf87',
          400: '#d4b896',
          500: '#c4a573',
          600: '#b08d4f',
          700: '#8e723c',
          800: '#6b562c',
          900: '#483a1d',
        },
      },
      fontFamily: {
        sans: ['"Satoshi"', '"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Nohemi"', '"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        semibold: '700',
      },
    },
  },
  plugins: [],
}
