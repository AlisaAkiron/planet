import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { staticConfig } from '../config'
import { getPreviewConfig } from '../server/functions'
import appCss from '../styles.css?url'
// Same text face as the site; see apps/web/src/routes/__root.tsx.
import 'misans/lib/Normal/MiSansVF.min.css'

// Pre-paint OS theme, so a dark editor doesn't flash a light page before
// the first render message arrives (which may then override it).
const themeInitScript = `document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Planet Preview' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [{ children: themeInitScript }],
  }),
  // The static build has no server to ask; its config is baked in.
  loader: () =>
    import.meta.env.PREVIEW_TARGET === 'static'
      ? staticConfig
      : getPreviewConfig(),
  // The document lives in the shell: it is all the static build
  // prerenders, and everything inside renders on the client.
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    // data-theme is set by themeInitScript before hydration
    <html lang="zh" suppressHydrationWarning>
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
