import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/pages/HomePage'

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
  component: HomePage,
})
