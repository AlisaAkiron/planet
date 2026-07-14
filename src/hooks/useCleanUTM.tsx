import { useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { rybbitReady } from '@/lib/rybbit/client'

export const useCleanUTM = () => {
  const pathname = useRouterState({ select: s => s.location.pathname })

  useEffect(() => {
    const hasUtm = [...new URLSearchParams(window.location.search).keys()].some(
      key => key.startsWith('utm_'),
    )
    if (!hasUtm) return

    // Wait for Rybbit's initial pageview before rewriting the URL — it reads
    // the URL (including utm_ params) on a requestAnimationFrame after init,
    // so stripping early loses campaign attribution. `cancelled` guards
    // against the component unmounting or the route changing while we wait.
    let cancelled = false
    rybbitReady.then(() => {
      if (cancelled) return

      const url = new URL(window.location.href)
      for (const key of [...url.searchParams.keys()]) {
        if (key.startsWith('utm_')) url.searchParams.delete(key)
      }
      const cleanHref = `${url.pathname}${url.search}${url.hash}`

      // Rewrite the URL via the unpatched native History method. Both Rybbit and
      // TanStack Router patch window.history.replaceState on the history
      // instance — Rybbit's patch fires a pageview on every call, so routing
      // this cleanup through the patched method (e.g. router navigate) would log
      // a duplicate, utm-less pageview for the same page. The prototype method is
      // untouched, so this updates the address bar silently. Current history
      // state is preserved to keep TanStack's scroll/key data intact; no route
      // reads search params, so the router's in-memory location going briefly
      // stale is inconsequential.
      History.prototype.replaceState.call(
        window.history,
        window.history.state,
        '',
        cleanHref,
      )
    })

    return () => {
      cancelled = true
    }
  }, [pathname])
}
