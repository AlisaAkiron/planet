import { cn } from '@/lib/utils'
import { HTML } from '@/types'

export const HeroContent: HTML<'div'> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'hero-content relative mx-auto size-full min-w-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
