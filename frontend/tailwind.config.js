/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta do PDT - Azul e Verde
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#c1dffd',
          300: '#a2cffe',
          400: '#5ba3fd',
          500: '#1e77fd', // Azul PDT principal
          600: '#1b5fc7',
          700: '#1548a0',
          800: '#103078',
          900: '#0b1f50',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Verde secundário
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        success: {
          50: '#f0fdf4',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-pdt': 'linear-gradient(135deg, #1e77fd 0%, #22c55e 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1b5fc7 0%, #15803d 100%)',
      },
    },
  },
  plugins: [],
}
