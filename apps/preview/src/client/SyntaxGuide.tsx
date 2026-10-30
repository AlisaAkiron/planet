import {
  AUDIO_EXTENSIONS,
  GITLAB_HOSTS,
  HIGHLIGHT_LANGUAGES,
  VIDEO_EXTENSIONS,
} from '@planet/markdown/config'
import { useRef } from 'react'
import type { RenderMode } from './renderer'
import type { ReactNode } from 'react'

interface CardType {
  label: string
  example: string
  /** Its metadata host doesn't allow browser (CORS) reads. */
  needsServer?: boolean
}

const CARD_PROVIDERS: { name: string; note?: string; types: CardType[] }[] = [
  {
    name: 'GitHub',
    types: [
      { label: 'Profile', example: 'https://github.com/<user>' },
      { label: 'Repository', example: 'https://github.com/<owner>/<repo>' },
      { label: 'Pull request', example: '…/<repo>/pull/<n>' },
      { label: 'Issue', example: '…/<repo>/issues/<n>' },
      { label: 'File', example: '…/<repo>/blob/<ref>/<path>#L10-L20' },
      { label: 'Directory', example: '…/<repo>/tree/<ref>/<path>' },
    ],
  },
  {
    name: 'GitLab',
    note: GITLAB_HOSTS.join(', '),
    types: [
      { label: 'User / group', example: 'https://gitlab.com/<group>' },
      { label: 'Project', example: 'https://gitlab.com/<group>/<project>' },
      { label: 'Merge request', example: '…/<project>/-/merge_requests/<n>' },
      { label: 'Issue', example: '…/<project>/-/issues/<n>' },
      { label: 'File', example: '…/<project>/-/blob/<ref>/<path>#L10-20' },
    ],
  },
  {
    name: 'X',
    note: 'x.com or twitter.com',
    types: [
      { label: 'Profile', example: 'https://x.com/<handle>' },
      { label: 'Post', example: 'https://x.com/<handle>/status/<id>' },
    ],
  },
  {
    name: 'YouTube',
    types: [
      {
        label: 'Video',
        example:
          'https://www.youtube.com/watch?v=<id> · youtu.be/<id> · /shorts/<id>',
      },
      {
        label: 'Channel',
        example: 'https://www.youtube.com/@<handle>',
        needsServer: true,
      },
    ],
  },
  {
    name: 'Bilibili',
    types: [
      { label: 'Video', example: 'https://www.bilibili.com/video/BV…' },
      {
        label: 'Profile',
        example: 'https://space.bilibili.com/<uid>',
        needsServer: true,
      },
    ],
  },
  {
    name: 'Telegram',
    types: [
      {
        label: 'Channel',
        example: 'https://t.me/<channel>',
        needsServer: true,
      },
      {
        label: 'Post',
        example: 'https://t.me/<channel>/<id>',
        needsServer: true,
      },
    ],
  },
]

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <section className="mt-6 first:mt-0">
    <h3 className="mb-2 text-base font-semibold">{title}</h3>
    <div className="space-y-2 text-sm">{children}</div>
  </section>
)

const Example = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-lg bg-base-200 p-3 font-mono text-xs">
    {children}
  </pre>
)

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-base-200 px-1 font-mono text-xs">{children}</code>
)

/**
 * What the renderer understands beyond plain markdown, opened from a
 * toolbar button. Lists come from @planet/markdown/config, the data
 * the pipeline itself uses, so they can't drift from what renders.
 */
export const SyntaxGuide = ({ mode }: { mode: RenderMode }) => {
  const dialog = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="btn btn-sm btn-ghost"
      >
        Syntax guide
      </button>
      <dialog ref={dialog} className="modal">
        <div className="modal-box max-w-3xl">
          <form method="dialog">
            <button
              aria-label="Close"
              className="btn btn-circle btn-ghost btn-sm absolute top-3 right-3"
            >
              ✕
            </button>
          </form>
          <h2 className="mb-1 text-lg font-semibold">Syntax guide</h2>
          <p className="mb-6 text-sm opacity-70">
            Everything here is plain GitHub-flavoured markdown, so notes still
            read well on GitHub and in other editors — they just won't get the
            cards and players.
          </p>

          <Section title="Markdown">
            <p>
              GFM: tables, task lists, strikethrough (<Code>~one~</Code> or{' '}
              <Code>~~two~~</Code>), autolinks, footnotes (<Code>[^1]</Code>),
              and YAML frontmatter between <Code>---</Code> lines at the top.
            </p>
            <p>
              Inline HTML for what markdown lacks: <Code>{'<details>'}</Code>,{' '}
              <Code>{'<kbd>'}</Code>, <Code>{'<sub>'}</Code>,{' '}
              <Code>{'<sup>'}</Code>, <Code>{'<mark>'}</Code>,{' '}
              <Code>{'<ins>'}</Code>, <Code>{'<abbr>'}</Code>,{' '}
              <Code>{'<ruby>'}</Code>.
            </p>
          </Section>

          <Section title="Link cards">
            <p>
              Paste a supported URL <strong>alone in its own paragraph</strong>.
              A URL inside a sentence, or a <Code>[labelled](url)</Code> link,
              stays a normal link.
            </p>
            {mode === 'browser' && (
              <p className="opacity-70">
                This page renders in your browser, which can only read data from
                sites that allow it (CORS). Cards marked{' '}
                <span className="badge badge-warning badge-xs">server</span>{' '}
                fall back to a plain card here; the server build fetches them.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <tbody>
                  {CARD_PROVIDERS.flatMap(provider =>
                    provider.types.map((type, i) => (
                      <tr key={`${provider.name}-${type.label}`}>
                        <th className="w-36 align-top whitespace-normal">
                          {i === 0 && provider.name}
                          {i === 0 && provider.note && (
                            <div className="font-normal opacity-60">
                              {provider.note}
                            </div>
                          )}
                        </th>
                        <td className="whitespace-nowrap">
                          {type.label}
                          {mode === 'browser' && type.needsServer && (
                            <span className="badge badge-warning badge-xs ml-1">
                              server
                            </span>
                          )}
                        </td>
                        <td className="font-mono">{type.example}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Code">
            <Example>
              {'```ts title="src/index.ts"\nconst answer = 42\n```'}
            </Example>
            <p>
              <Code>title=</Code> puts a file name on the block. Highlighted:{' '}
              {HIGHLIGHT_LANGUAGES.join(', ')} (and their usual aliases, like{' '}
              <Code>ts</Code>, <Code>py</Code>, <Code>sh</Code>). Other
              languages show as plain text.
            </p>
          </Section>

          <Section title="Diagrams">
            <Example>{'```mermaid\ngraph LR\n  A --> B\n```'}</Example>
          </Section>

          <Section title="Math">
            <Example>
              {'Inline $E = mc^2$\n\n$$\n\\int_0^1 x^2 \\thinspace dx\n$$'}
            </Example>
            <p>
              To keep display math intact on GitHub too: put row breaks{' '}
              <Code>{'\\\\'}</Code> at line ends, and use named commands instead
              of backslash-punctuation — <Code>\thinspace</Code> not{' '}
              <Code>\,</Code>, <Code>\lbrace</Code> not <Code>{'\\{'}</Code>.
            </p>
          </Section>

          <Section title="Images and media">
            <Example>{'![Alt text](image.webp "Caption")'}</Example>
            <p>
              On an image alone in its paragraph, the title becomes a caption.
              Images zoom on click, unless they are links. A bare link to a
              video ({VIDEO_EXTENSIONS.join(', ')}) or audio file (
              {AUDIO_EXTENSIONS.join(', ')}), alone in its paragraph, becomes a
              player.
            </p>
          </Section>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
