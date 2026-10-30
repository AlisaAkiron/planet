import { MarkdownView } from '@planet/markdown/react'
import { useLoaderData } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { isRenderMessage } from '../protocol'
import { pickMode } from './mode'
import { PreviewLinkCard, RenderModeContext } from './PreviewLinkCard'
import { About } from './About'
import { Toolbar } from './Toolbar'
import { useRender } from './useRender'
import { useTheme } from './useTheme'
import type { PreviewTheme, ReadyMessage } from '../protocol'
import type { RenderMode } from './renderer'
import type { MarkdownComponents } from '@planet/markdown/react'

/**
 * Embedded in an editor (an iframe): documents arrive by postMessage from
 * an allowed origin. Opened directly: a scratch editor beside the preview,
 * for trying the renderer without a plugin. Either way the document
 * renders in this page's Web Worker, or on the server when it offers that.
 */
export const PreviewPage = () => {
  const config = useLoaderData({ from: '__root__' })
  // Client-only route (ssr: false), so window is always there.
  const [embedded] = useState(() => window.parent !== window)
  const [mode] = useState(() => pickMode(config))
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [theme, setTheme] = useState<PreviewTheme>()
  useTheme(theme)
  const { result, error } = useRender(markdown, mode)

  useEffect(() => {
    if (!embedded) return
    const onMessage = (event: MessageEvent) => {
      // Only the embedding editor itself: right origin and the parent
      // frame, not another frame the page happens to share it with.
      if (
        event.source !== window.parent ||
        !config.allowedOrigins.includes(event.origin) ||
        !isRenderMessage(event.data)
      ) {
        return
      }
      setMarkdown(event.data.markdown)
      setTheme(event.data.theme)
    }
    window.addEventListener('message', onMessage)
    const ready: ReadyMessage = { type: 'planet-preview:ready' }
    window.parent.postMessage(ready, '*')
    return () => window.removeEventListener('message', onMessage)
  }, [embedded, config])

  const preview = (
    <RenderModeContext value={mode}>
      <main className="min-w-0 flex-1 px-6 py-8">
        <Toolbar mode={mode} />
        {error && (
          <div
            role="alert"
            className="alert alert-error alert-soft mb-6 text-sm"
          >
            Render failed: {error}
          </div>
        )}
        {result && (
          <MarkdownView
            tree={result.tree}
            components={components}
            className="mx-auto max-w-3xl"
          />
        )}
      </main>
    </RenderModeContext>
  )

  if (embedded) return preview
  return (
    <div className="flex min-h-screen">
      <ScratchEditor mode={mode} onChange={setMarkdown} />
      {preview}
    </div>
  )
}

// Module-level so MarkdownView's conversion stays memoized across renders.
const components: MarkdownComponents = { 'link-card': PreviewLinkCard }

const STORAGE_KEY = 'planet-preview-scratch'

const ScratchEditor = ({
  mode,
  onChange,
}: {
  mode: RenderMode
  onChange: (value: string) => void
}) => {
  const [value, setValue] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? '',
  )

  // Debounced like an editor plugin would, so typing doesn't fire a
  // render per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(value)
      localStorage.setItem(STORAGE_KEY, value)
    }, 150)
    return () => clearTimeout(timer)
  }, [value, onChange])

  return (
    <aside className="sticky top-0 flex h-screen w-1/2 flex-col border-r border-base-300 bg-base-200">
      <About mode={mode} />
      <textarea
        aria-label="Markdown source"
        placeholder="Type or paste markdown…"
        value={value}
        onChange={event => setValue(event.target.value)}
        className="min-h-0 flex-1 resize-none bg-transparent p-6 font-mono text-sm outline-none"
      />
    </aside>
  )
}
