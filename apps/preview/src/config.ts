import { DEFAULT_ALLOWED_ORIGINS } from './protocol'
import type { PreviewConfig } from './protocol'

/** Comma-separated origins, or the defaults when unset. */
export const parseOrigins = (value: string | undefined): string[] => {
  const origins = value
    ?.split(',')
    .map(item => item.trim())
    .filter(Boolean)
  return origins?.length ? origins : DEFAULT_ALLOWED_ORIGINS
}

/**
 * The static build's settings, fixed at build time — there is no server
 * to ask. Changing the allowed origins means rebuilding.
 */
export const staticConfig: PreviewConfig = {
  allowedOrigins: parseOrigins(import.meta.env.VITE_PREVIEW_ALLOWED_ORIGINS),
  serverRender: false,
}
