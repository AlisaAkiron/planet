import { parseOrigins } from '../config.ts'
import type { PreviewConfig } from '../protocol.ts'

/**
 * The server build's settings, read from the environment on each call so
 * dev picks up changes without a restart. The server build always offers
 * server rendering; a deployment that shouldn't is what the static build
 * is for.
 */
export const loadConfig = (
  env: Record<string, string | undefined> = process.env,
): PreviewConfig => ({
  allowedOrigins: parseOrigins(env.PREVIEW_ALLOWED_ORIGINS),
  serverRender: true,
})
