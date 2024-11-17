import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

import pluginNext from '@next/eslint-plugin-next'
import parser from '@typescript-eslint/parser'

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    name: 'ESLint config for Next.JS',
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': pluginNext,
    },
    files: ['**/*.{js,jsx,ts,tsx,cjs,mjs}'],
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  pluginPrettierRecommended,
]

export default config
