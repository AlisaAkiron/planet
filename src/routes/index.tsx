import { createFileRoute } from '@tanstack/react-router'
import { HomePage, type SocialMedia } from '@/pages/HomePage'

const SOCIAL_LINKS_URL = 'https://r2.alisaqaq.moe/social-links.json'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: '迷いの森' },
      {
        name: 'description',
        content: "Alisa Akiron's personal portfolio",
      },
    ],
  }),
  loader: async (): Promise<{ socialMedia: SocialMedia[] }> => {
    const response = await fetch(SOCIAL_LINKS_URL)
    const socialMedia = (await response.json()) as SocialMedia[]
    return { socialMedia }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { socialMedia } = Route.useLoaderData()
  return <HomePage socialMedia={socialMedia} />
}
