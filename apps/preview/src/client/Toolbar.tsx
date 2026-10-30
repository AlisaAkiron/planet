import { GitHubIcon } from '@planet/markdown/react'
import { SyntaxGuide } from './SyntaxGuide'
import type { RenderMode } from './renderer'

export const REPOSITORY_URL = 'https://github.com/AlisaAkiron/planet'

/** Corner controls, in both the standalone and the embedded page. */
export const Toolbar = ({ mode }: { mode: RenderMode }) => (
  <div className="fixed top-3 right-3 z-10 flex items-center gap-1 rounded-field bg-base-100/80 backdrop-blur">
    <SyntaxGuide mode={mode} />
    <a
      href={REPOSITORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Source on GitHub"
      title="Source on GitHub"
      className="btn btn-sm btn-ghost btn-square"
    >
      <GitHubIcon className="h-4 w-4" />
    </a>
  </div>
)
