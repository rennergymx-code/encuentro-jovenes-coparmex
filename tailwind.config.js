/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        'sans': ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        branding: {
          orange: '#FF5100',
          teal: '#376B88',
          peach: '#FC9E87',
          lavender: '#D1B1D2',
          violet: '#2D0066',
          deep: '#1A0033',
        },
        premium: {
          orange: '#FF5100',
          emerald: '#10b981',
          indigo: '#6366f1',
          slate: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
