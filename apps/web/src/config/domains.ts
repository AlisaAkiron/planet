/**
 * Central registry of external domains this site trusts. Everything the
 * site itself fetches derives its allowlist from here — add a domain in
 * this file, not at the call sites. Hosts the renderer fetches link-card
 * metadata from live with it, in @planet/markdown's config.ts.
 */

/**
 * Origins the markdown renderer may fetch documents from, in addition to
 * the site's own origin. Content from these hosts is trusted: it is
 * rendered with raw HTML enabled and its renders are cached like local
 * assets.
 */
export const TRUSTED_MARKDOWN_ORIGINS = ['https://atmos.alisaqaq.moe']
