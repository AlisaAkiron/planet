import type { PreviewConfig } from '../protocol'
import type { RenderMode } from './renderer'

/**
 * The server build renders on the server unless the URL asks for
 * ?render=browser; the static build always renders in the browser.
 */
export const pickMode = (config: PreviewConfig): RenderMode =>
  config.serverRender &&
  new URLSearchParams(window.location.search).get('render') !== 'browser'
    ? 'server'
    : 'browser'
