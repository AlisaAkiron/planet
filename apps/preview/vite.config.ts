import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

const ENTITY_DECODER = 'decode-named-character-reference'

/**
 * The renderer runs in a Web Worker, which has no DOM, but Vite resolves
 * worker code with the page's `browser` condition — and micromark's
 * entity decoder has a `browser` build that touches `document` on load.
 * Swaps in its plain build. Targeted rather than adding the `worker`
 * condition globally: TanStack Router maps `worker` to its server build.
 */
const plainEntityDecoder = (): Plugin => ({
  name: 'planet:plain-entity-decoder',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (source !== ENTITY_DECODER) return null
    const resolved = await this.resolve(source, importer, {
      ...options,
      skipSelf: true,
    })
    return (
      resolved && {
        ...resolved,
        id: resolved.id.replace(/index\.dom\.js$/, 'index.js'),
      }
    )
  },
})

/**
 * Two builds from one app:
 * - server (default): dist/, the Node server for Docker. Documents render
 *   on the server, like the site; ?render=browser switches to the worker.
 * - static (PREVIEW_TARGET=static): dist-static/, plain files for any
 *   static host. The shell is prerendered at build time and documents
 *   render only in the browser.
 */
const target = process.env.PREVIEW_TARGET === 'static' ? 'static' : 'server'

export default defineConfig(({ command }) => ({
  plugins: [
    plainEntityDecoder(),
    tanstackStart(
      target === 'static'
        ? { spa: { enabled: true, prerender: { outputPath: '/index' } } }
        : {},
    ),
    react(),
  ],
  define: {
    'import.meta.env.PREVIEW_TARGET': JSON.stringify(target),
  },
  // Dev pre-bundling resolves dependencies itself, outside Vite's plugin
  // pipeline; hook the same swap in there.
  optimizeDeps: { rolldownOptions: { plugins: [plainEntityDecoder()] } },
  worker: {
    // ES workers can code-split, so the render worker loads shiki
    // grammars lazily, like the server does.
    format: 'es',
    plugins: () => [plainEntityDecoder()],
  },
  build: {
    // As in apps/web: keep woff2 subsets as files so unicode-range works.
    assetsInlineLimit: (filePath: string) =>
      filePath.endsWith('.woff2') ? false : undefined,
    // mermaid's lazy-loaded parser chunks; see apps/web/vite.config.ts.
    chunkSizeWarningLimit: 700,
  },
  ...(target === 'static' && {
    environments: {
      client: { build: { outDir: 'dist-static' } },
      // Start compiles the server only to prerender the shell; keep it out
      // of the deployable output.
      ssr: { build: { outDir: 'node_modules/.cache/preview-prerender' } },
    },
  }),
  ssr: {
    // The server build is one self-contained bundle: the Docker image then
    // needs only Node and dist/, no node_modules. Build only — in dev,
    // Node loads dependencies itself (Vite's module runner can't evaluate
    // CommonJS ones like `debug`), and the linked workspace packages are
    // still run through Vite.
    noExternal: command === 'build' ? true : undefined,
  },
}))
