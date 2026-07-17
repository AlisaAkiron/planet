import { AnimatePresence, m } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { JSX } from 'react'

type Zoom = {
  top: number
  left: number
  width: number
  height: number
  x: number
  y: number
  scale: number
}

/**
 * Medium-style zoom for markdown images (rehype-zoom-image emits
 * <zoom-image> for every image not wrapped in a link). Click animates
 * a fixed clone from the image's rect to a viewport-fit rect over a
 * dimmed backdrop; click, Esc, or scroll dismisses. Transform-only
 * FLIP, so it works under LazyMotion domAnimation (no layout feature)
 * and MotionConfig reducedMotion="user" degrades it to a fade.
 */
export const ZoomImage = ({
  alt = '',
  ...props
}: JSX.IntrinsicElements['img']) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<Zoom | null>(null)
  // The inline image stays hidden until the exit animation finishes,
  // so the clone always reads as the same element moving.
  const [hidden, setHidden] = useState(false)

  const open = () => {
    const img = imgRef.current
    if (!img) return
    const rect = img.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = Math.min(vw, vh) * 0.05
    // Never upscale past natural size (blurry); naturalWidth is 0
    // while the image is still loading — no cap then.
    const cap = img.naturalWidth > 0 ? img.naturalWidth / rect.width : Infinity
    const scale = Math.min(
      (vw - margin * 2) / rect.width,
      (vh - margin * 2) / rect.height,
      cap,
    )
    setZoom({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      x: vw / 2 - (rect.left + rect.width / 2),
      y: vh / 2 - (rect.top + rect.height / 2),
      scale,
    })
    setHidden(true)
  }

  const close = () => {
    setZoom(null)
    buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!zoom) return
    overlayRef.current?.focus()
    const dismiss = () => close()
    window.addEventListener('scroll', dismiss, { passive: true })
    window.addEventListener('wheel', dismiss, { passive: true })
    window.addEventListener('touchmove', dismiss, { passive: true })
    return () => {
      window.removeEventListener('scroll', dismiss)
      window.removeEventListener('wheel', dismiss)
      window.removeEventListener('touchmove', dismiss)
    }
  }, [zoom])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={open}
        aria-label={alt ? `Enlarge image: ${alt}` : 'Enlarge image'}
        className="zoom-image cursor-zoom-in border-0 bg-transparent p-0"
      >
        <img
          ref={imgRef}
          alt={alt}
          {...props}
          style={hidden ? { opacity: 0 } : undefined}
        />
      </button>
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence onExitComplete={() => setHidden(false)}>
            {zoom && (
              <m.div
                ref={overlayRef}
                role="dialog"
                aria-modal="true"
                aria-label={alt || 'Enlarged image'}
                tabIndex={-1}
                className="fixed inset-0 z-50 cursor-zoom-out bg-base-100/80 backdrop-blur-sm outline-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
                onKeyDown={e => {
                  if (e.key === 'Escape') close()
                }}
              >
                <m.img
                  src={props.src}
                  alt={alt}
                  className="rounded-xl"
                  style={{
                    position: 'absolute',
                    top: zoom.top,
                    left: zoom.left,
                    width: zoom.width,
                    height: zoom.height,
                  }}
                  initial={{ x: 0, y: 0, scale: 1 }}
                  animate={{ x: zoom.x, y: zoom.y, scale: zoom.scale }}
                  exit={{ x: 0, y: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
                />
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
