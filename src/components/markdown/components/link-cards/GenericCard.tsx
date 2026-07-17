import { CardRow } from './CardShell'
import { LinkIcon } from './icons'
import type { CardPayload } from '@/lib/markdown/link-cards/types'

export const GenericCard = ({ card }: { card: CardPayload }) => {
  const { url, meta } = card
  let domain = url
  try {
    domain = new URL(url).hostname
  } catch {
    // keep full url
  }
  return (
    <CardRow
      href={url}
      icon={<LinkIcon className="h-6 w-6 opacity-60" />}
      title={meta?.title ?? domain}
      subtitle={meta?.description ?? url}
    />
  )
}
