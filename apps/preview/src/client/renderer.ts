import { renderDocument } from '../server/functions'
import type { RenderResponse } from '../protocol'

export type RenderMode = 'browser' | 'server'

export interface Renderer {
  render: (markdown: string, signal: AbortSignal) => Promise<RenderResponse>
}

export interface WorkerRequest {
  id: number
  markdown: string
}

export type WorkerResponse =
  | { id: number; result: RenderResponse }
  | { id: number; error: string }
  | { id: number; superseded: true }

const abortError = () => new DOMException('render aborted', 'AbortError')

/** Renders in this page's Web Worker (render.worker.ts). */
const createBrowserRenderer = (): Renderer => {
  const worker = new Worker(new URL('./render.worker.ts', import.meta.url), {
    type: 'module',
  })
  const pending = new Map<
    number,
    {
      resolve: (result: RenderResponse) => void
      reject: (error: unknown) => void
    }
  >()
  let nextId = 0

  worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
    const response = event.data
    const request = pending.get(response.id)
    // Aborted on this side already: the answer has no one waiting.
    if (!request) return
    pending.delete(response.id)
    if ('result' in response) request.resolve(response.result)
    else if ('error' in response) request.reject(new Error(response.error))
    else request.reject(abortError())
  })

  return {
    render: (markdown, signal) =>
      new Promise((resolve, reject) => {
        const id = nextId++
        pending.set(id, { resolve, reject })
        signal.addEventListener('abort', () => {
          pending.delete(id)
          reject(abortError())
        })
        worker.postMessage({ id, markdown } satisfies WorkerRequest)
      }),
  }
}

/** Renders on the server; only the server build offers it. */
const serverRenderer: Renderer = {
  render: (markdown, signal) =>
    renderDocument({ data: { content: markdown }, signal }),
}

let browserRenderer: Renderer | undefined

/**
 * One renderer per mode for the page's lifetime — created outside React,
 * so StrictMode's double-invoked initializers can't spawn a second worker.
 */
export const getRenderer = (mode: RenderMode): Renderer => {
  // Constant-folded per build, so the static bundle carries no server call.
  if (import.meta.env.PREVIEW_TARGET === 'server' && mode === 'server') {
    return serverRenderer
  }
  browserRenderer ??= createBrowserRenderer()
  return browserRenderer
}
