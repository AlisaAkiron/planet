import type rybbit from '@rybbit/js'

type RybbitConfig = Parameters<typeof rybbit.init>[0]

/**
 * Read from `VITE_RYBBIT_*` env vars at build time (see `.env.example`). The
 * Site ID and host are public identifiers, so embedding them in the client
 * bundle is safe. Per-environment values come from Vite's mode-specific env
 * files (`.env.development`, `.env.production`).
 */
export const rybbitConfig: RybbitConfig = {
  analyticsHost: import.meta.env.VITE_RYBBIT_HOST,
  siteId: import.meta.env.VITE_RYBBIT_SITE_ID,
}

/** Whether both required values are present; init is skipped otherwise. */
export const isRybbitConfigured =
  !!rybbitConfig.analyticsHost && !!rybbitConfig.siteId
