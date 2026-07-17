import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * Fixed top progress bar for scroll position through `targetRef`. Driven
 * imperatively (transform: scaleX on its own ref, compositor-only) so
 * per-frame scroll updates never re-render any React component.
 */
export const ReadingProgressBar = ({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>
}) => {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    const bar = barRef.current
    if (!target || !bar) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress =
        total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1
      bar.style.transform = `scaleX(${progress})`
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
  }, [targetRef])

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 h-1 w-full origin-left scale-x-0 bg-primary"
    />
  )
}
