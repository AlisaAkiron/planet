import { useEffect, useState } from 'react'
import { getRenderer } from './renderer'
import type { RenderResponse } from '../protocol'
import type { RenderMode } from './renderer'

export interface RenderState {
  result: RenderResponse | null
  error: string | null
}

/**
 * Renders `markdown` in the given mode, keeping the last good result on
 * screen while a newer one is in flight. Each change aborts the previous
 * render, so a slow one can never overwrite a newer one. Waits until there
 * is a document.
 */
export const useRender = (
  markdown: string | null,
  mode: RenderMode,
): RenderState => {
  const [state, setState] = useState<RenderState>({
    result: null,
    error: null,
  })

  useEffect(() => {
    if (markdown === null) return
    const controller = new AbortController()
    getRenderer(mode)
      .render(markdown, controller.signal)
      .then(result => setState({ result, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState(previous => ({
          result: previous.result,
          error: error instanceof Error ? error.message : String(error),
        }))
      })
    return () => controller.abort()
  }, [markdown, mode])

  return state
}
