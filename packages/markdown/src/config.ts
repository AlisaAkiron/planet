/*
 * What the renderer recognizes, as plain data: imported by the pipeline,
 * and by apps (as @planet/markdown/config) to describe the syntax to
 * users without pulling in the pipeline itself.
 */

export { HIGHLIGHT_LANGUAGES, LANG_ALIASES } from './languages.ts'

/**
 * Full domain names treated as GitLab instances by the GitLab link card.
 * URLs on any other host — even ones that look like `gitlab.something` —
 * render as plain links and are never fetched for metadata. Lives with the
 * renderer rather than in an app so every app renders the same cards.
 */
export const GITLAB_HOSTS = [
  'gitlab.com',
  'git.alisaqaq.moe',
  'gitlab.gnome.org',
  'gitlab.freedesktop.org',
]

/** Bare links to these files, alone in a paragraph, become players. */
export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v']
export const AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'ogg',
  'oga',
  'flac',
  'm4a',
  'aac',
  'opus',
]
