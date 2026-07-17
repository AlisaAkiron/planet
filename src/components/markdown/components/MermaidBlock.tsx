import { useEffect, useId, useState } from 'react'
import { useThemeContext } from '@/providers/ThemeProvider'

/**
 * Mermaid cannot run on Workers (needs a DOM), so SSR ships the diagram
 * source as a code block and the client lazily swaps in the rendered SVG.
 */
export const MermaidBlock = ({ code = '' }: { code?: string }) => {
  const reactId = useId()
  const { activeTheme } = useThemeContext()
  const [svg, setSvg] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: activeTheme === 'dark' ? 'dark' : 'neutral',
        })
        // mermaid uses the id as a DOM selector — strip useId's punctuation
        const id = `mmd${reactId.replace(/[^a-zA-Z0-9]/g, '')}`
        const result = await mermaid.render(id, code)
        if (!cancelled) {
          setSvg(result.svg)
          setError(undefined)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [code, reactId, activeTheme])

  if (error) {
    return (
      <div className="mermaid-block not-prose my-6 rounded-xl border border-error/40 bg-base-200 p-4">
        <p className="text-sm text-error">Couldn’t render this diagram.</p>
        <p className="mt-1 mb-2 font-mono text-xs text-error/80">{error}</p>
        <pre className="overflow-x-auto font-mono text-sm opacity-70">
          {code}
        </pre>
      </div>
    )
  }

  if (!svg) {
    return (
      <pre className="mermaid-block not-prose my-6 overflow-x-auto rounded-xl bg-base-200 p-4 font-mono text-sm">
        {code}
      </pre>
    )
  }

  return (
    <div
      className="mermaid-block not-prose my-6 overflow-x-auto"
      // Generated locally from the diagram source with securityLevel:
      // 'strict', which sanitizes embedded text.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
