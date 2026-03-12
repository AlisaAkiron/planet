import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useCleanUTM } from '@/hooks/useCleanUTM'
import { DefaultLayout } from '@/layout/DefaultLayout'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { UmamiProvider } from '@/providers/UmamiProvider'
import appCss from '@/styles/index.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: '迷いの森' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'shortcut icon', href: '/favicon.ico' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
    scripts: import.meta.env.PROD
      ? [
          {
            src: 'https://umami.alisaqaq.moe/script.js',
            defer: true,
            async: true,
            'data-website-id': 'ba92d41a-ee5c-4f25-8ff6-d3e8c9728ce9',
            'data-domains': 'alisaqaq.moe',
          },
        ]
      : [
          {
            src: 'https://umami.alisaqaq.moe/script.js',
            defer: true,
            async: true,
            'data-website-id': 'b4dbc717-e2d5-463d-943b-8d64f7c9e491',
            'data-domains': 'localhost',
          },
        ],
  }),
  notFoundComponent: NotFoundPage,
  component: RootComponent,
})

function RootComponent() {
  useCleanUTM()

  return (
    <RootDocument>
      <UmamiProvider>
        <ThemeProvider>
          <DefaultLayout>
            <Outlet />
          </DefaultLayout>
        </ThemeProvider>
      </UmamiProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <div className="flex flex-col gap-8 justify-center items-center min-h-screen">
      <h1 className="text-4xl font-semibold">404 - Not Found</h1>
      <a href="/" className="btn btn-primary py-3 px-6">
        返回主页
      </a>
    </div>
  )
}
