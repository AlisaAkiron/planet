/**
 * Central registry of external domains this site trusts. Everything that
 * fetches remote content on the site's behalf derives its allowlist from
 * here — add a domain in this file, not at the call sites.
 */

/**
 * Origins the markdown renderer may fetch documents from, in addition to
 * the site's own origin. Content from these hosts is trusted: it is
 * rendered with raw HTML enabled and its renders are cached like local
 * assets.
 */
export const TRUSTED_MARKDOWN_ORIGINS = ['https://atmos.alisaqaq.moe']

/**
 * Full domain names treated as GitLab instances by the GitLab link card.
 * URLs on any other host — even ones that look like `gitlab.something` —
 * render as plain links and are never fetched for metadata.
 */
export const GITLAB_HOSTS = [
  'gitlab.com',
  'git.alisaqaq.moe',
  'gitlab.gnome.org',
  'gitlab.freedesktop.org',
]
