import rybbit from '@rybbit/js'
import { isRybbitConfigured, rybbitConfig } from '@/lib/rybbit/config'

/**
 * Resolves once Rybbit has had a chance to record the initial pageview (or once
 * we know it never will, e.g. when analytics is not configured).
 *
 * `rybbit.init()` awaits a remote-config fetch before scheduling the initial
 * pageview inside a `requestAnimationFrame`. That pageview reads the current URL
 * — including `utm_*` params — at the moment it fires. `useCleanUTM` must wait
 * for this promise before stripping those params, otherwise it wins the race and
 * Rybbit records a UTM-less URL, losing campaign attribution.
 */
let resolveReady: () => void
export const rybbitReady = new Promise<void>(resolve => {
  resolveReady = resolve
})

let started = false

/** Initialize Rybbit exactly once and resolve {@link rybbitReady} afterwards. */
export const initRybbit = async () => {
  if (started) return rybbitReady
  started = true

  if (!isRybbitConfigured) {
    console.warn(
      '[Rybbit] Skipping init: VITE_RYBBIT_HOST and VITE_RYBBIT_SITE_ID are not set.',
    )
    resolveReady()
    return rybbitReady
  }

  try {
    await rybbit.init(rybbitConfig)
  } catch (error) {
    console.error('[Rybbit] Failed to initialize analytics:', error)
    resolveReady()
    return rybbitReady
  }

  // The initial pageview is queued in a requestAnimationFrame inside Rybbit's
  // init. That callback was registered before this point, so by waiting one more
  // frame we guarantee the pageview (with UTM params intact) has already fired.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => resolveReady())
  })

  return rybbitReady
}
