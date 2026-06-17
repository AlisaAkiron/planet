import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useCleanUTM } from '@/hooks/useCleanUTM'
import { DefaultLayout } from '@/layout/DefaultLayout'
import { RybbitProvider } from '@/providers/RybbitProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
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
  }),
  notFoundComponent: NotFoundPage,
  component: RootComponent,
})

function RootComponent() {
  useCleanUTM()

  return (
    <RootDocument>
      <RybbitProvider>
        <ThemeProvider>
          <DefaultLayout>
            <Outlet />
          </DefaultLayout>
        </ThemeProvider>
      </RybbitProvider>
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
