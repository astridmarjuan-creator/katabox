/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        ink: '#1f2430',
        paper: '#ffffff',
        mist: '#f4f6fb',
        line: '#e6e9f2',
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b8d1ff',
          300: '#8bb3ff',
          400: '#5c8fff',
          500: '#3366ff',
          600: '#254fdb',
          700: '#1c3cad',
          800: '#182f83',
          900: '#152867',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,36,48,0.04), 0 4px 16px rgba(31,36,48,0.06)',
        pop: '0 8px 30px rgba(31,36,48,0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
