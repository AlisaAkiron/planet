import { type HTMLMotionProps, m } from 'motion/react'
import { createElement } from 'react'
import { TextUpTransition } from './TextUpTransition'

export type TypewriterTemplate = {
  type: string
  text: string
  class: string
}

export type TypeWriterProps = {
  template: TypewriterTemplate[]
  initialDelay?: number
  as?: 'div' | 'h1'
} & Omit<HTMLMotionProps<'div'>, 'children'>

export const Typewriter = ({
  template,
  initialDelay,
  as,
  ...props
}: TypeWriterProps) => {
  const MotionTag = (as === 'h1' ? m.h1 : m.div) as typeof m.div

  return (
    <MotionTag
      initial={{ opacity: 0.0001, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: initialDelay,
        duration: 0.35,
        type: 'spring',
        stiffness: 120,
        damping: 20,
      }}
      {...props}
    >
      {template.map((t, i) => {
        const { type } = t
        const prevAllTextLength = template.slice(0, i).reduce((acc, cur) => {
          return acc + (cur.text?.length || 0)
        }, 0)
        return createElement(
          type,
          { key: i, className: t.class },
          t.text && (
            <TextUpTransition
              initialDelay={prevAllTextLength * 0.05 + (initialDelay || 0)}
              eachDelay={0.05}
            >
              {t.text}
            </TextUpTransition>
          ),
        )
      })}
    </MotionTag>
  )
}

export const estimateTypewriterDuration = (template: TypewriterTemplate[]) =>
  template.reduce((acc, cur) => acc + cur.text.length, 0) * 0.05
