/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vert: {
          50: '#f2f7f3', 100: '#e1ece5', 200: '#c3d9cb', 300: '#98bfa6',
          400: '#699f7e', 500: '#47815f', 600: '#33684b', 700: '#28533c',
          800: '#123d2a', 900: '#0e3022', 950: '#071c13'
        },
        terre: {
          50: '#fdf6ef', 100: '#f9e9d6', 200: '#f2d0ac', 300: '#e7ae79',
          400: '#db8a4c', 500: '#d0702f', 600: '#bd5927', 700: '#9c4423',
          800: '#7d3722', 900: '#662f1e'
        },
        creme: { 50: '#fdfbf6', 100: '#faf6ec', 200: '#f3ecdc', 300: '#e9dfc9' },
        encre: { 500: '#5c665f', 700: '#33403a', 900: '#16211b' }
      },
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
      borderRadius: { xl2: '1.25rem', xl3: '1.75rem' },
      boxShadow: {
        doux: '0 1px 2px rgba(18,61,42,.05), 0 8px 24px -12px rgba(18,61,42,.18)',
        carte: '0 2px 4px rgba(18,61,42,.04), 0 18px 40px -24px rgba(18,61,42,.28)',
        leve: '0 24px 60px -30px rgba(18,61,42,.45)'
      },
      keyframes: {
        'monte': { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'none' } },
        'apparait': { from: { opacity: '0' }, to: { opacity: '1' } },
        'glisse-gauche': { from: { opacity: '0', transform: 'translateX(-24px)' }, to: { opacity: '1', transform: 'none' } },
        'respire': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'barre': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        'pulse-doux': { '0%,100%': { opacity: '1' }, '50%': { opacity: '.55' } }
      },
      animation: {
        monte: 'monte .6s cubic-bezier(.22,.61,.36,1) both',
        apparait: 'apparait .5s ease-out both',
        'glisse-gauche': 'glisse-gauche .55s cubic-bezier(.22,.61,.36,1) both',
        respire: 'respire 6s ease-in-out infinite',
        barre: 'barre .9s cubic-bezier(.22,.61,.36,1) both',
        'pulse-doux': 'pulse-doux 2.4s ease-in-out infinite'
      },
      transitionTimingFunction: { doux: 'cubic-bezier(.22,.61,.36,1)' }
    }
  },
  plugins: []
};
