/**
 * postMessage protocol between an editor plugin (the parent window) and
 * the preview page (an iframe of this server's / page).
 *
 *   page   → parent  { type: 'planet-preview:ready' }
 *            Sent once the listener is up; the parent should (re)send the
 *            current document. Carries nothing, so it goes to any origin.
 *   parent → page    { type: 'planet-preview:render', markdown, theme? }
 *            Accepted only from the allowed origins (PREVIEW_ALLOWED_ORIGINS
 *            at runtime for the server build, VITE_PREVIEW_ALLOWED_ORIGINS
 *            at build time for the static one). The page renders raw HTML
 *            from the document, so an unchecked sender could run script in
 *            the preview origin.
 *
 * Where the document renders doesn't change the protocol: on the server
 * in the server build, in the page's own Web Worker in the static one.
 */

import type { MarkdownResult } from '@planet/markdown'
import type { Root } from 'hast'

export type PreviewTheme = 'light' | 'dark'

export interface ReadyMessage {
  type: 'planet-preview:ready'
}

export interface RenderMessage {
  type: 'planet-preview:render'
  markdown: string
  /** Follows the OS preference when omitted. */
  theme?: PreviewTheme
}

export const isRenderMessage = (data: unknown): data is RenderMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as RenderMessage).type === 'planet-preview:render' &&
  typeof (data as RenderMessage).markdown === 'string'

/**
 * Origins of the editor apps allowed to drive the preview page: Obsidian
 * desktop and Obsidian iOS (Capacitor). Obsidian Android's origin is
 * http://localhost, which any local web server on port 80 shares, so it
 * is left to opt in through the allowed-origins setting.
 */
export const DEFAULT_ALLOWED_ORIGINS = [
  'app://obsidian.md',
  'capacitor://localhost',
]

/**
 * Wire format of the server render: the hast tree as one JSON string, as
 * with the site's renderMarkdown.
 */
export type SerializedRender = Omit<MarkdownResult, 'tree'> & { tree: string }

/**
 * Result of a render in either mode: the worker's hast root, or the
 * server's JSON string — MarkdownView takes both.
 */
export type RenderResponse =
  | SerializedRender
  | (Omit<MarkdownResult, 'tree'> & { tree: Root })

export interface PreviewConfig {
  allowedOrigins: string[]
  /** Whether the server can render (server build) or not (static build). */
  serverRender: boolean
}
