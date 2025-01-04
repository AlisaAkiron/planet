import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    extend: {
      keyframes: {
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeftAndFade: {
          from: { opacity: '0', transform: 'translateX(2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideUpAndFade: {
          from: { opacity: '0', transform: 'translateY(2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRightAndFade: {
          from: { opacity: '0', transform: 'translateX(-2px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        slideDownAndFade:
          'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade:
          'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade:
          'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  darkMode: ['selector', '[data-theme="dark]'],
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    darkTheme: 'dark',
    themes: [
      {
        light: {
          primary: '#f9a8d4',
          secondary: '#fde047',
          accent: '#60a5fa',
          neutral: '#fecdd3',
          'base-100': '#f1f1f1',
          info: '#93c5fd',
          success: '#73d7b2',
          warning: '#fbbf24',
          error: '#f57b9c',
        },
      },
      {
        dark: {
          'color-scheme': 'dark',

          primary: '#f9a8d4',
          secondary: '#fde047',
          accent: '#60a5fa',
          neutral: '#fecdd3',
          'base-100': '#1e1e1e',
          info: '#93c5fd',
          success: '#73d7b2',
          warning: '#fbbf24',
          error: '#f57b9c',
        },
      },
    ],
  },
}

export default config
