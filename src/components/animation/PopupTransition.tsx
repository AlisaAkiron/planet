import { motion } from 'motion/react'

type PopupTransitionProps = {
  children: React.ReactNode
  initialDelay?: number
  duration?: number
  initialScale?: number
}

export const PopupTransition = ({
  children,
  initialDelay,
  duration,
  initialScale,
}: PopupTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale || 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: initialDelay || 0, duration: duration || 0.3 }}
    >
      {children}
    </motion.div>
  )
}
