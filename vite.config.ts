import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    react(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // mermaid's prebundled langium/chevrotain parser chunk is ~663 kB and
    // fully lazy-loaded; it can't be split further
    chunkSizeWarningLimit: 700,
    // Never base64-inline small woff2 subsets into CSS — the font CSS
    // relies on unicode-range so browsers fetch only the chunks a page
    // actually renders; inlining would ship them all upfront.
    assetsInlineLimit: (filePath: string) =>
      filePath.endsWith('.woff2') ? false : undefined,
  },
})
