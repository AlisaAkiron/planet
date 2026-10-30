import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { HomePage, type SocialMedia } from '@/pages/HomePage'

const SOCIAL_LINKS_URL = 'https://r2.alisaqaq.moe/social-links.json'

const isValidSocialMedia = (entry: SocialMedia | null | undefined) =>
  !!entry &&
  typeof entry.url === 'string' &&
  /^(https:|mailto:)/.test(entry.url) &&
  typeof entry.icon === 'string' &&
  /^[a-z0-9-]+$/.test(entry.icon)

// Runs on the server even during client-side navigation — the R2 bucket does
// not send CORS headers, so the browser must never fetch it directly. Social
// links are decorative: on any failure (outage, bad JSON, timeout) render the
// page without them instead of failing the whole route.
const fetchSocialLinks = createServerFn().handler(
  async (): Promise<SocialMedia[]> => {
    try {
      const response = await fetch(SOCIAL_LINKS_URL, {
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) return []
      const data = (await response.json()) as SocialMedia[]
      return Array.isArray(data) ? data.filter(isValidSocialMedia) : []
    } catch {
      return []
    }
  },
)

export const Route = createFileRoute('/')({
  loader: async (): Promise<{ socialMedia: SocialMedia[] }> => {
    return { socialMedia: await fetchSocialLinks() }
  },
  staleTime: 300_000,
  head: () => ({
    meta: [
      { title: '迷いの森' },
      {
        name: 'description',
        content: "Alisa Akiron's personal portfolio",
      },
      { property: 'og:title', content: '迷いの森' },
      {
        property: 'og:description',
        content: "Alisa Akiron's personal portfolio",
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: 'https://alisaqaq.moe/avatar.webp' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { socialMedia } = Route.useLoaderData()
  return <HomePage socialMedia={socialMedia} />
}
