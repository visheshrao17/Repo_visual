/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 30px -18px rgba(15, 23, 42, 0.55)',
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        reveal: 'reveal 0.45s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        reveal: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0px)' },
        },
      },
    },
  },
  plugins: [],
}

