import { cn } from '@/lib/utils'
import type { HTML } from '@/types'

export const HeroContainer: HTML<'div'> = ({ children, className, ...props }) => {
  return (
    <div className={cn(className, 'hero bg-base-100 min-h-screen')} {...props}>
      {children}
    </div>
  )
}
