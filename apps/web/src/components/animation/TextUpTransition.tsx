import { m } from 'motion/react'
import type { JSXElement } from '@/types'

export type TextUpTransitionProps = {
  eachDelay?: number
  initialDelay?: number
} & JSXElement<'span'>

export const TextUpTransition = ({
  eachDelay,
  initialDelay,
  children,
  ...props
}: TextUpTransitionProps) => {
  eachDelay = eachDelay ?? 0.05
  initialDelay = initialDelay ?? 0

  const text = (children as string) || ''

  // Screen readers would announce the per-character spans letter by letter,
  // so expose the full text once and hide the animated copy from the
  // accessibility tree.
  return (
    <span {...props}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <m.span
            key={i}
            className="inline-block whitespace-pre"
            initial={{ y: 10, opacity: 0.001 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
                duration: 0.1,
                delay: i * eachDelay + initialDelay,
              },
            }}
          >
            {char}
          </m.span>
        ))}
      </span>
    </span>
  )
}
