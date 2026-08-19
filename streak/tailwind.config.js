/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        system: {
          void: '#060913',
          dark: '#0a0f1d',
          surface: '#0f172a',
          surfaceHover: '#17223b',
          surfaceCard: 'rgba(15, 23, 42, 0.85)',
          border: '#1e293b',
          borderGlow: '#00f0ff',
          borderSubtle: '#152138',
          cyan: '#00f0ff',
          cyanGlow: '#00d2ff',
          blue: '#0070f3',
          blueDark: '#003366',
          purple: '#a855f7',
          purpleGlow: '#c084fc',
          gold: '#fbbf24',
          danger: '#ef4444',
          textMuted: '#64748b',
          textLight: '#94a3b8',
          textWhite: '#f8fafc',
        },
        github: {
          dark: '#060913',
          surface: '#0f172a',
          surfaceHover: '#17223b',
          border: '#1e293b',
          borderSubtle: '#152138',
          muted: '#64748b',
          text: '#cbd5e1',
          heading: '#f8fafc',
          green: {
            subtle: '#082f49',
            light: '#0284c7',
            medium: '#00f0ff',
            bright: '#38bdf8',
            glow: '#00f0ff'
          },
          accent: '#00f0ff',
          accentHover: '#38bdf8',
          danger: '#ef4444',
          dangerSubtle: '#7f1d1d'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'system-glow': '0 0 20px rgba(0, 240, 255, 0.25)',
        'system-glow-lg': '0 0 35px rgba(0, 240, 255, 0.4)',
        'system-purple': '0 0 25px rgba(168, 85, 247, 0.3)',
        'system-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'system-pulse': 'systemPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'hologram-flicker': 'hologramFlicker 4s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-up': 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'level-up': 'levelUp 1s ease-out forwards',
      },
      keyframes: {
        systemPulse: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))' },
          '50%': { opacity: '.8', filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.2))' }
        },
        hologramFlicker: {
          '0%, 100%': { opacity: '0.98' },
          '50%': { opacity: '1' },
          '52%': { opacity: '0.92' },
          '54%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        levelUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
