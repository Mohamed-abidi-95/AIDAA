/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        brand: {
          green: '#10b981',
          orange: '#f97316',
          blue: '#1e293b',
          bg: '#f8fafc'
        }
      },
      animation: {
        // Smooth entrance — used on modals, toasts, cards
        'page-in':  'pageIn  0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':  'fadeIn  0.35s ease both',
        'slide-up': 'slideUp 0.4s  cubic-bezier(0.16, 1, 0.3, 1) both',
        // Slide-down for error banners
        'slideDown': 'slideDown 0.3s ease both',
      },
      keyframes: {
        pageIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0)   scale(1)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

