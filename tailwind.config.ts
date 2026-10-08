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
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      /* Sharp, restrained corners — depth comes from hairline borders */
      borderRadius: {
        none: '0px',
        sm: '1px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        '3xl': '2px',
        full: '9999px',
      },
      /* Flat elevation: at most a whisper of a shadow */
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px hsl(35 25% 10% / 0.05)',
        DEFAULT: '0 1px 2px hsl(35 25% 10% / 0.06)',
        md: '0 1px 3px hsl(35 25% 10% / 0.07)',
        lg: '0 2px 4px hsl(35 25% 10% / 0.07)',
        xl: '0 2px 6px hsl(35 25% 10% / 0.08)',
        '2xl': '0 4px 10px hsl(35 25% 10% / 0.10)',
        inner: 'inset 0 1px 2px hsl(35 25% 10% / 0.06)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        success: { DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))' },
        warning: { DEFAULT: 'hsl(var(--warning))', foreground: 'hsl(var(--warning-foreground))' },
        /* Reserved brand red — the mobile conversation action only */
        brand: { DEFAULT: 'hsl(var(--brand-red))', foreground: 'hsl(var(--brand-red-fg))' },
        /* Ink chrome — sidebar, topbar, bottom nav, marketing bands */
        chrome: {
          DEFAULT: 'hsl(var(--sidebar-bg))',
          fg: 'hsl(var(--sidebar-fg))',
          muted: 'hsl(var(--sidebar-muted))',
          active: 'hsl(var(--sidebar-active))',
          hover: 'hsl(var(--sidebar-hover))',
          border: 'hsl(var(--sidebar-border))',
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
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        swift: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '250': '250ms',
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
