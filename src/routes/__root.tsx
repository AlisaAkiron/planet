import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import type { ReactNode } from 'react'
import { useCleanUTM } from '@/hooks/useCleanUTM'
import { DefaultLayout } from '@/layout/DefaultLayout'
import { RybbitProvider } from '@/providers/RybbitProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import appCss from '@/styles/index.css?url'
// Site-wide text face, through Vite (not the Tailwind pipeline) so the
// font url()s get rebased and the woff2 files land in the build. MiSans
// declares non-standard weights (Light=250, Medium=380, Bold=630): 300
// resolves to Light, body 400 to Medium, 600-800 to Bold.
import 'misans/lib/Normal/MiSans-Light.min.css'
import 'misans/lib/Normal/MiSans-Medium.min.css'
import 'misans/lib/Normal/MiSans-Bold.min.css'
// The two Basic Latin chunks (16 KB each) are preloaded below; '.latin'
// is the misans package's chunk name — re-check it on misans major bumps.
import misansLightLatin from 'misans/lib/Normal/MiSans-Light.latin.woff2?url'
import misansMediumLatin from 'misans/lib/Normal/MiSans-Medium.latin.woff2?url'

// Applies the persisted theme before first paint so a stored choice that
// differs from the OS preference doesn't flash the wrong theme. data-theme
// carries the resolved theme (drives DaisyUI); data-theme-mode carries the
// stored mode incl. 'auto' (drives ThemeSwitch's CSS-only current-mode UI).
// Keep the storage key and the auto → OS resolution in sync with
// ThemeProvider (which owns both attributes after hydration; the value is
// JSON-encoded by @mantine/hooks' useLocalStorage).
const themeInitScript = `(function(){var m;try{m=JSON.parse(localStorage.getItem('planet-theme'))}catch(e){}if(m!=='light'&&m!=='dark'&&m!=='auto'){m='auto'}var t=m==='auto'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;var r=document.documentElement;r.setAttribute('data-theme',t);r.setAttribute('data-theme-mode',m)})()`

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
      // Above-the-fold text (hero, nav, footer) is almost entirely Basic
      // Latin; preloading starts these fetches from the initial HTML
      // instead of after CSSOM+layout. CJK/kana chunks swap in normally.
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: misansLightLatin,
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: misansMediumLatin,
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
    // head() scripts land in <head> via HeadContent (blocking, pre-paint);
    // the route-level scripts() option would render at the end of <body>
    // instead — too late to prevent the flash.
    scripts: [{ children: themeInitScript }],
  }),
  notFoundComponent: NotFoundPage,
  component: RootComponent,
})

function RootComponent() {
  useCleanUTM()

  return (
    <RootDocument>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <RybbitProvider>
            <ThemeProvider>
              <DefaultLayout>
                <Outlet />
              </DefaultLayout>
            </ThemeProvider>
          </RybbitProvider>
        </MotionConfig>
      </LazyMotion>
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
    <div className="flex flex-col gap-6 justify-center items-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-semibold">404</h1>
      <p className="text-base-content/70">
        这个页面不存在，可能已被移动或删除。
      </p>
      <Link to="/" className="btn btn-primary py-3 px-6">
        返回主页
      </Link>
    </div>
  )
}
