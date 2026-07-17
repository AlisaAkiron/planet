import { useEffect, useState } from 'react'
import type { TocEntry } from '@/lib/markdown/plugins/rehype-headings'

/** Headings crossing above this viewport line count as "being read". */
const READING_LINE_PX = 120

/**
 * id of the heading currently being read, for ToC highlighting. Scroll-
 * driven and rAF-throttled; state only changes when the heading does, so
 * consumers don't re-render per scroll frame. Re-runs when the ToC (i.e.
 * the document) changes.
 */
export const useActiveHeading = (toc: TocEntry[]): string | null => {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = toc
      .map(entry => document.getElementById(entry.id))
      .filter(el => el !== null)

    let frame = 0
    const update = () => {
      frame = 0
      let active: string | null = null
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= READING_LINE_PX) {
          active = heading.id
        } else {
          break
        }
      }
      setActiveId(active)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [toc])

  return activeId
}
