import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { PreviewPage } from '../client/PreviewPage'

export const Route = createFileRoute('/')({
  // Client-only: the document always arrives after load (by postMessage or
  // from the scratch editor), so there is nothing to render on the server.
  ssr: false,
  // The static build's prerendered shell leaves a Suspense boundary here,
  // but records no route state saying so; without the boundary (and the
  // ClientOnly below, rendering nothing until hydration is done) the client
  // would render the page straight into it and fail hydration.
  wrapInSuspense: true,
  component: () => (
    <ClientOnly>
      <PreviewPage />
    </ClientOnly>
  ),
})
