import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

/** Card chrome shared by every link-card variant. */
export const cardFrame =
  'link-card not-prose my-6 rounded-xl border border-base-300 bg-base-200'

/** Frame + link affordances, for cards that are a single anchor. */
export const cardLink = `${cardFrame} no-underline transition-colors hover:border-primary`

export const CardShell = ({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(cardLink, 'flex items-center gap-4 p-4', className)}
  >
    {children}
  </a>
)

/** Compact fallback row: icon, title, subtitle, optional trailing badge. */
export const CardRow = ({
  href,
  icon,
  title,
  subtitle,
  badge,
}: {
  href: string
  icon: ReactNode
  title: ReactNode
  subtitle: ReactNode
  badge?: ReactNode
}) => (
  <CardShell href={href}>
    <span className="shrink-0">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold">{title}</p>
      <p className="truncate text-sm opacity-60">{subtitle}</p>
    </div>
    {badge}
  </CardShell>
)
