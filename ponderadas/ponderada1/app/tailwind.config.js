/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#10451d', // Verde escuro
        primary: '#fbc531',    // Amarelo/Dourado
        text: '#ffffff',
        textSecondary: '#a9a9a9',
        play: '#4cd137',
        doubt: '#e84118',
        disabled: '#576574',
        cardBg: '#fefefe',
        cardText: '#333333'
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px',
      }
    },
  },
  plugins: [],
};
