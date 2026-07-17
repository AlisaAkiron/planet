import { useClipboard } from '@mantine/hooks'
import { useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { langInfo } from './lang-info'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  CopyIcon,
} from './link-cards/icons'
import type { ReactNode } from 'react'

/** Blocks longer than this collapse behind a "Show all" fade. */
const FOLD_LINES = 30

const COLLAPSED_MAX_HEIGHT = '24rem'

/**
 * GitHub-style code frame: header with optional file path (from
 * ```lang:path or ```lang title=path fences), language name + logo, and a
 * copy button; the shiki <pre> sits below. Long blocks start folded and
 * animate open/closed.
 */
export const CodeBlock = ({
  lang = 'text',
  lines = 0,
  title,
  children,
}: {
  lang?: string
  lines?: number
  title?: string
  children?: ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const clipboard = useClipboard({ timeout: 2000 })
  // undefined = folded; set to the full content height while expanded
  const [expandedHeight, setExpandedHeight] = useState<string>()
  const expanded = expandedHeight !== undefined
  const { label, iconPath } = langInfo(lang)

  const foldable = lines > FOLD_LINES

  const copy = () => {
    const text = containerRef.current?.querySelector('pre')?.innerText
    if (text) clipboard.copy(text)
  }

  const expand = () => {
    // scrollHeight of the clipped body = full content height
    const body = bodyRef.current
    setExpandedHeight(body ? `${body.scrollHeight}px` : 'none')
  }

  const collapse = () => {
    setExpandedHeight(undefined)
    // Folding pulls the page up from below; reorient to the block top when
    // it has scrolled out of view. The block's document position does not
    // change, so this can run alongside the height animation.
    const container = containerRef.current
    if (container && container.getBoundingClientRect().top < 0) {
      // behavior left to CSS scroll-behavior, which already respects
      // prefers-reduced-motion (tailwind.css)
      container.scrollIntoView({ block: 'start' })
    }
  }

  return (
    <div
      ref={containerRef}
      className="code-block not-prose my-6 scroll-mt-20 overflow-hidden rounded-xl border border-base-300 bg-base-200"
    >
      <div className="flex items-center gap-3 border-b border-base-300 px-4 py-2">
        {title ? (
          <span className="min-w-0 flex-1 truncate font-mono text-xs">
            {title}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <span className="flex shrink-0 items-center gap-1.5 text-xs opacity-70">
          {iconPath ? (
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5 fill-current"
            >
              <path d={iconPath} />
            </svg>
          ) : (
            <CodeIcon className="h-3.5 w-3.5" />
          )}
          {label}
        </span>
        <button
          onClick={copy}
          className="btn btn-ghost btn-xs btn-square shrink-0"
          aria-label={clipboard.copied ? 'Copied' : 'Copy code'}
        >
          {clipboard.copied ? (
            <CheckIcon className="h-3.5 w-3.5 text-success" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5 opacity-70" />
          )}
        </button>
      </div>
      <div
        ref={bodyRef}
        className={cn(
          foldable &&
            'overflow-hidden transition-[max-height] duration-300 ease-in-out motion-reduce:transition-none',
        )}
        style={
          foldable
            ? { maxHeight: expandedHeight ?? COLLAPSED_MAX_HEIGHT }
            : undefined
        }
      >
        {children}
        {foldable && (
          // Sticky (not absolute) so it stays pinned to the visible bottom
          // even when find-in-page or focus scrolls the clipped region.
          <button
            onClick={expand}
            aria-expanded={expanded}
            tabIndex={expanded ? -1 : 0}
            className={cn(
              'sticky bottom-0 -mt-24 flex h-24 w-full cursor-pointer items-end justify-center bg-gradient-to-t from-base-200 via-base-200/70 to-transparent pb-2 transition-opacity duration-300',
              expanded && 'pointer-events-none opacity-0',
            )}
          >
            <span className="flex items-center gap-1 text-xs opacity-70 transition-opacity hover:opacity-100">
              <ChevronDownIcon className="h-3.5 w-3.5" />
              Show all {lines} lines
            </span>
          </button>
        )}
      </div>
      {foldable && expanded && (
        <button
          onClick={collapse}
          aria-expanded={true}
          className="flex w-full cursor-pointer items-center justify-center gap-1 border-t border-base-300 py-1.5 text-xs opacity-60 transition-opacity hover:opacity-100"
        >
          <ChevronUpIcon className="h-3.5 w-3.5" />
          Collapse
        </button>
      )}
    </div>
  )
}
