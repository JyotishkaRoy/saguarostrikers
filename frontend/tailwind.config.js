/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space Blue - Primary (Professional, Space-themed)
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc5fb',
          400: '#36a7f7',
          500: '#0c8ce8',
          600: '#006dc6',
          700: '#0157a1',
          800: '#054a85',
          900: '#0a3e6e',
          950: '#072849',
        },
        // Rocket Orange - Secondary (Energy, Action, Fire)
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Accent matches logo colors (Navy Blue + Orange)
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // Match secondary orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Success Green
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Warning/Alert
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Danger/Error
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-space': 'linear-gradient(135deg, #0a3e6e 0%, #072849 50%, #0c1e35 100%)',
        'gradient-rocket': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(10, 62, 110, 0.95) 0%, rgba(7, 40, 73, 0.95) 100%)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(12, 140, 232, 0.3)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
      },
    },
  },
  plugins: [],
}
