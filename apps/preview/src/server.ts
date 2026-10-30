import { fileURLToPath } from 'node:url'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

const entry = createServerEntry({
  fetch(request) {
    return handler.fetch(request)
  },
})

export default entry

// `node dist/server/server.js` in production starts a Node listener around
// the handler. Vite dev and `vite preview` import this module instead, so
// for them it stays a plain fetch handler.
if (import.meta.main) {
  const { listen } = await import('./server/node.ts')
  // This module is dist/server/server.js; the client build sits beside it.
  listen(entry.fetch, fileURLToPath(new URL('../client', import.meta.url)))
}
