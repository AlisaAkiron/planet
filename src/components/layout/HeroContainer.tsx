import { cn } from '@/lib/utils'
import { HTML } from '@/types'

export const HeroContainer: HTML<'div'> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn(className, 'hero min-h-screen bg-base-200')} {...props}>
      {children}
    </div>
  )
}
