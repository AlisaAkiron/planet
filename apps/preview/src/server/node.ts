import { serve } from 'srvx'
import { staticMiddleware } from 'srvx/static'
import { MAX_DOCUMENT_BYTES } from '../render-options.ts'
import type { ServerHandler, ServerMiddleware } from 'srvx'

// Vite content-hashes everything under assets/.
const immutableAssets: ServerMiddleware = async (request, next) => {
  const response = await next()
  if (response.ok && new URL(request.url).pathname.startsWith('/assets/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  return response
}

/**
 * The production listener: the built client's static files, then the
 * Start handler.
 */
export const listen = (fetch: ServerHandler, clientDir: string) =>
  serve({
    fetch,
    middleware: [immutableAssets, staticMiddleware({ dir: clientDir })],
    // Loopback by default. The Docker image binds 0.0.0.0 inside the
    // container instead, and the published port decides the exposure.
    hostname: process.env.HOST ?? '127.0.0.1',
    port: Number(process.env.PORT ?? 8787),
    maxRequestBodySize: MAX_DOCUMENT_BYTES,
  })
