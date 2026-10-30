import { REPOSITORY_URL } from './Toolbar'
import type { RenderMode } from './renderer'

/** What this page is — shown above the scratch editor. */
export const About = ({ mode }: { mode: RenderMode }) => (
  <header className="border-b border-base-300 px-6 py-4 text-sm">
    <h1 className="text-base font-semibold">Planet Preview</h1>
    <p className="mt-1 opacity-80">
      A playground for the markdown renderer behind Planet, my personal website:
      GitHub-flavoured markdown plus link cards, code highlighting, math and
      diagrams. Type or paste on the left to try it — and if you'd like
      rendering like this for your own site, the source is on GitHub under the
      MIT license.
    </p>
    <p className="mt-2 opacity-60">
      {mode === 'browser'
        ? 'This page renders in your browser: what you type never leaves your device. Only link-card data is fetched, straight from each site.'
        : 'This instance renders on its server, which also fetches link-card data.'}{' '}
      <a
        href={REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="link"
      >
        Source on GitHub
      </a>
    </p>
  </header>
)
