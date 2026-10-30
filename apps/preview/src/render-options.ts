/**
 * Failed link-card fetches are remembered this long, in both render modes.
 * The page re-renders on every edit; without this, a rate-limited API
 * (GitHub allows 60 unauthenticated requests an hour) would be retried on
 * each keystroke.
 */
export const FAILURE_TTL_SECONDS = 300

/** Largest document the server build renders. */
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024
