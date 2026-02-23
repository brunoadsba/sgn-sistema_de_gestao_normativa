import type { Config } from "tailwindcss";
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // === CORES ===
      colors: {
        // Cores primárias SGN
        'sgn-primary': {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        
        'sgn-success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        
        'sgn-warning': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        
        'sgn-danger': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        
        // Compatibilidade com shadcn/ui
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      // === TIPOGRAFIA ===
      fontFamily: {
        'sgn-sans': ['Inter', 'system-ui', 'sans-serif'],
        'sgn-mono': ['JetBrains Mono', 'Consolas', 'monospace']
      },
      
      fontSize: {
        'sgn-xs': '0.75rem',
        'sgn-sm': '0.875rem',
        'sgn-base': '1rem',
        'sgn-lg': '1.125rem',
        'sgn-xl': '1.25rem',
        'sgn-2xl': '1.5rem',
        'sgn-3xl': '1.875rem',
        'sgn-4xl': '2.25rem',
        'sgn-5xl': '3rem'
      },
      
      fontWeight: {
        'sgn-normal': '400',
        'sgn-medium': '500',
        'sgn-semibold': '600',
        'sgn-bold': '700',
        'sgn-extrabold': '800'
      },
      
      lineHeight: {
        'sgn-tight': '1.25',
        'sgn-normal': '1.5',
        'sgn-relaxed': '1.75'
      },

      // === ESPAÇAMENTO SGN ===
      spacing: {
        'sgn-xs': '0.25rem',
        'sgn-sm': '0.5rem',
        'sgn-md': '1rem',
        'sgn-lg': '1.5rem',
        'sgn-xl': '2rem',
        'sgn-2xl': '3rem',
        'sgn-3xl': '4rem'
      },

      // === BORDAS SGN ===
      borderRadius: {
        'sgn-sm': '0.125rem',
        'sgn-base': '0.25rem',
        'sgn-md': '0.375rem',
        'sgn-lg': '0.5rem',
        'sgn-xl': '0.75rem',
        'sgn-2xl': '1rem',
        'sgn-3xl': '1.5rem'
      },

      // === SOMBRAS SGN ===
      boxShadow: {
        'sgn-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sgn-base': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'sgn-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'sgn-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'sgn-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'sgn-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
      },

      // === TRANSIÇÕES SGN ===
      transitionDuration: {
        'sgn-fast': '150ms',
        'sgn-normal': '200ms',
        'sgn-slow': '300ms'
      },
      
      transitionTimingFunction: {
        'sgn-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'sgn-ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'sgn-ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'sgn-ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },

      // === Z-INDEX SGN ===
      zIndex: {
        'sgn-hide': '-1',
        'sgn-auto': 'auto',
        'sgn-base': '0',
        'sgn-docked': '10',
        'sgn-dropdown': '1000',
        'sgn-sticky': '1100',
        'sgn-banner': '1200',
        'sgn-overlay': '1300',
        'sgn-modal': '1400',
        'sgn-popover': '1500',
        'sgn-skip-link': '1600',
        'sgn-toast': '1700',
        'sgn-tooltip': '1800'
      },

      // === BREAKPOINTS SGN ===
      screens: {
        'sgn-sm': '640px',
        'sgn-md': '768px',
        'sgn-lg': '1024px',
        'sgn-xl': '1280px',
        'sgn-2xl': '1536px'
      },

      // === ANIMAÇÕES SGN ===
      animation: {
        "sgn-fade-in": "sgnFadeIn 0.5s ease-in-out",
        "sgn-slide-up": "sgnSlideUp 0.3s ease-out",
        "sgn-slide-down": "sgnSlideDown 0.3s ease-out",
        "sgn-scale-in": "sgnScaleIn 0.2s ease-out",
        "sgn-pulse": "sgnPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      
      keyframes: {
        sgnFadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        sgnSlideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        sgnSlideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        sgnScaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        sgnPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
