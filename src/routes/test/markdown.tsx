import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { MarkdownView } from '@/components/markdown/MarkdownView'
import { ReadingProgressBar } from '@/components/markdown/ReadingProgressBar'
import { useActiveHeading } from '@/components/markdown/useActiveHeading'
import { renderMarkdown } from '@/lib/markdown/render'
import { cn } from '@/utils/cn'
import type { TocEntry } from '@/lib/markdown/render'

export const Route = createFileRoute('/test/markdown')({
  loader: () =>
    renderMarkdown({ data: { url: '/test-fixtures/markdown-full.md' } }),
  head: () => ({
    meta: [{ title: 'Markdown Render Test · 迷いの森' }],
  }),
  component: MarkdownTestPage,
})

const Toc = ({
  toc,
  activeHeadingId,
}: {
  toc: TocEntry[]
  activeHeadingId: string | null
}) => {
  const navRef = useRef<HTMLElement>(null)
  const [indicator, setIndicator] = useState<{
    top: number
    height: number
  } | null>(null)

  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>(
      'a[aria-current="true"]',
    )
    setIndicator(
      active ? { top: active.offsetTop, height: active.offsetHeight } : null,
    )
  }, [activeHeadingId])

  return (
    <nav ref={navRef} aria-label="目录" className="relative pl-3">
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 m-0 w-0.5 rounded-full bg-primary transition-all duration-300 ease-out',
          indicator ? 'opacity-100' : 'opacity-0',
        )}
        style={indicator ?? undefined}
      />
      <p className="mb-2 text-sm font-semibold opacity-60">目录</p>
      {toc.map(entry => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          aria-current={entry.id === activeHeadingId ? 'true' : undefined}
          style={{ paddingLeft: `${(entry.depth - 1) * 0.75}rem` }}
          className={cn(
            'block truncate py-1 text-sm transition-colors duration-300',
            entry.id === activeHeadingId
              ? 'font-medium text-primary'
              : 'opacity-60 hover:opacity-100',
          )}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  )
}

function MarkdownTestPage() {
  const { tree, toc, frontmatter } = Route.useLoaderData()
  const contentRef = useRef<HTMLDivElement>(null)
  const activeHeadingId = useActiveHeading(toc)

  return (
    // DefaultLayout's <main> already pads px-4 below md and drops it at md+
    <div className="mx-auto w-full max-w-6xl py-8 md:px-4">
      <ReadingProgressBar targetRef={contentRef} />
      <div className="flex gap-10">
        <div ref={contentRef} className="min-w-0 flex-1">
          <MarkdownView tree={tree} />
        </div>
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <Toc toc={toc} activeHeadingId={activeHeadingId} />
            <div className="mt-6 border-t border-base-300 pt-4">
              <p className="mb-2 text-sm font-semibold opacity-60">
                Frontmatter
              </p>
              <pre className="overflow-x-auto text-xs opacity-70">
                {JSON.stringify(frontmatter, null, 2)}
              </pre>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
