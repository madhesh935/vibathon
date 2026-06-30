/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020617',
          900: '#0a0f1e',
          850: '#0c1320',
          800: '#0f172a',
          750: '#111827',
          700: '#1e293b',
        },
        emergency: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        mesh: {
          50: '#edfcf5',
          100: '#d3f8e5',
          200: '#aaf0ce',
          300: '#72e2b0',
          400: '#38cc8d',
          500: '#15b074',
          600: '#0c8e5d',
          700: '#0b724c',
          800: '#0c5a3d',
          900: '#0b4a33',
        },
        ops: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          teal: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 4s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.35s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.35)',
        'panel': '0 4px 32px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card': '0 2px 16px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
