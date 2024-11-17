import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {},
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
          'base-100': '#e9e9e9',
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
