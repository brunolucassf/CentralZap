/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // alterna via classe no <html>
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Verde esmeralda refinado (inspirado no WhatsApp)
        accent: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          soft: '#6ee7b7',
        },
        // Tons de fundo dark
        ink: {
          950: '#0a0d0c',
          900: '#0e1311',
          850: '#131a17',
          800: '#18211d',
          700: '#223029',
          600: '#2e3f36',
        },
        // Tons de fundo light
        paper: {
          50: '#f7f8f7',
          100: '#eef1ef',
          200: '#e2e7e3',
          300: '#d3dad4',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(0,0,0,0.18)',
        glass: '0 8px 32px -12px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(16,185,129,0.25), 0 8px 30px -10px rgba(16,185,129,0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'mesh': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(4%,-3%) scale(1.05)' },
          '66%': { transform: 'translate(-3%,4%) scale(0.97)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'mesh': 'mesh 14s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
