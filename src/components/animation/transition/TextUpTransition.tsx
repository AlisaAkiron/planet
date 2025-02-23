import { motion } from 'motion/react'

import { JSXC } from '@/types'

export const TextUpTransition: JSXC<
  'div',
  {
    eachDelay?: number
    initialDelay?: number
  }
> = ({ eachDelay, initialDelay, children, ...props }) => {
  eachDelay = eachDelay ?? 0.05
  initialDelay = initialDelay ?? 0

  const text = (children as string) || ''

  return (
    <div {...props}>
      {Array.from(text).map((char, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ transform: 'translateY(10px)', opacity: 0.001 }}
          animate={{
            transform: 'translateY(0px)',
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
        </motion.span>
      ))}
    </div>
  )
}
