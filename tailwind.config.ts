import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'surface-2': 'hsl(var(--surface-2))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        sidebar: 'hsl(var(--sidebar))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: '#ffffff',
          soft: 'hsl(var(--success-soft))',
          'soft-fg': 'hsl(var(--success-soft-fg))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: '#ffffff',
          soft: 'hsl(var(--warning-soft))',
          'soft-fg': 'hsl(var(--warning-soft-fg))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: '#ffffff',
          soft: 'hsl(var(--info-soft))',
          'soft-fg': 'hsl(var(--info-soft-fg))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      /* Typography scale — use these, not arbitrary sizes */
      fontSize: {
        'display': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h3': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['0.9375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.6' }],
        'sm': ['0.8125rem', { lineHeight: '1.55' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      boxShadow: {
        // Layered, low-noise elevation (Stripe-like)
        'card': '0 1px 2px 0 hsl(224 64% 10% / 0.04), 0 1px 3px 0 hsl(224 64% 10% / 0.06)',
        'card-hover': '0 4px 6px -1px hsl(224 64% 10% / 0.06), 0 10px 24px -4px hsl(224 64% 10% / 0.10)',
        'panel': '0 -1px 0 0 hsl(224 64% 10% / 0.04), 0 12px 32px -8px hsl(224 64% 10% / 0.12)',
        'overlay': '0 24px 64px -12px hsl(224 64% 10% / 0.25)',
        'focus-ring': '0 0 0 3px hsl(var(--ring) / 0.35)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'shimmer': {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'flow': {
          to: { strokeDashoffset: '-20' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in': 'slide-in 0.3s ease-out',
        'shimmer': 'shimmer 1.8s linear infinite',
        'flow': 'flow 0.9s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'indeterminate': 'indeterminate 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
