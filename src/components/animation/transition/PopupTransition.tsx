import { motion } from 'framer-motion'

import { FCC } from '@/types'

type PopupTransitionProps = {
  initialDelay?: number
  duration?: number
  initialScale?: number
}

export const PopupTransition: FCC<PopupTransitionProps> = ({
  children,
  initialDelay,
  duration,
  initialScale,
}) => {
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
