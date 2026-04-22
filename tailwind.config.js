/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#1565C0', light: '#1976D2', dark: '#0D47A1' },
        accent:  { DEFAULT: '#2E7D32', light: '#388E3C' },
      }
    }
  },
  plugins: [],
}

