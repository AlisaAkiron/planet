import { LinkCard } from '@planet/markdown/react'
import { createContext, use } from 'react'
import { FAILURE_TTL_SECONDS } from '../render-options'
import type { RenderMode } from './renderer'
import type { CardPayload, FetchFailure } from '@planet/markdown'

/** How the page renders — what a failure most likely means depends on it. */
export const RenderModeContext = createContext<RenderMode>('browser')

const hostOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

const timeOf = (epochMs: number) =>
  new Date(epochMs).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

const explain = (failure: FetchFailure, mode: RenderMode): string => {
  const host = hostOf(failure.url)
  switch (failure.reason) {
    case 'network':
      // fetch reports CORS refusals as plain network errors, so in the
      // browser that is by far the likelier cause.
      return mode === 'browser'
        ? `${host} doesn't let browsers read its data (CORS), or couldn't be reached. The server build can fetch it.`
        : `Couldn't reach ${host}.`
    case 'timeout':
      return `${host} didn't answer in time.`
    case 'rate-limited': {
      const reset = failure.resetAt
        ? `, resets at ${timeOf(failure.resetAt)}`
        : ''
      const github =
        host === 'api.github.com'
          ? ' GitHub allows 60 unauthenticated requests an hour.'
          : ''
      return `${host} rate limit reached${reset}.${github}`
    }
    case 'http':
      return failure.status === 404
        ? `${host} has nothing at this address (HTTP 404).`
        : `${host} answered HTTP ${failure.status ?? '?'}.`
    case 'invalid':
      return `${host} sent a response the card couldn't read.`
  }
}

/**
 * Preview-only link card: the card as the site renders it, plus why its
 * metadata is missing or partial — published pages just fall back to the
 * plain card silently.
 */
export const PreviewLinkCard = ({ card }: { card?: string }) => {
  const mode = use(RenderModeContext)
  let payload: CardPayload | null = null
  try {
    payload = card ? (JSON.parse(card) as CardPayload) : null
  } catch {
    // LinkCard renders nothing for an unreadable payload either
  }
  const failures = payload?.failures ?? []
  if (failures.length === 0) return <LinkCard card={card} />

  // One line per distinct problem: a repo card's three GitHub calls
  // hitting the same rate limit is one problem.
  const messages = [...new Set(failures.map(f => explain(f, mode)))]
  // A rate-limit failure is remembered until its reset, which the
  // message already states; anything else, for the fixed window.
  const retry = failures.some(f => f.resetAt)
    ? ''
    : ` · retried after ${Math.round(FAILURE_TTL_SECONDS / 60)} min`
  return (
    <div className="not-prose my-6 [&_.link-card]:my-0">
      <LinkCard card={card} />
      <div
        role="note"
        className="mt-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs"
      >
        <p className="font-semibold">
          {payload?.meta ? 'Card data incomplete' : 'Card data unavailable'}
          <span className="font-normal opacity-60">
            {` · shown in the preview only${retry}`}
          </span>
        </p>
        <ul className="mt-1 list-disc pl-4">
          {messages.map(message => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
