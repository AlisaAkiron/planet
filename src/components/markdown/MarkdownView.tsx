import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { useMemo } from 'react'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
// Through Vite (not the Tailwind pipeline) so the font url()s get rebased
// and the woff2 files land in the build. MiSans itself loads site-wide in
// routes/__root.tsx; only the markdown-scoped faces live here.
import 'katex/dist/katex.min.css'
// Regular + Italic + Medium + Bold cover everything the content uses:
// shiki (catppuccin) emits italic and bold tokens, inline code chips are 500.
import '@chinese-fonts/maple-mono-cn/dist/MapleMono-CN-Regular/result.css'
import '@chinese-fonts/maple-mono-cn/dist/MapleMono-CN-Italic/result.css'
import '@chinese-fonts/maple-mono-cn/dist/MapleMono-CN-Medium/result.css'
import '@chinese-fonts/maple-mono-cn/dist/MapleMono-CN-Bold/result.css'
import '@/styles/fonts.css'
import { cn } from '@/utils/cn'
import { CodeBlock } from './components/CodeBlock'
import { MediaEmbed } from './components/MediaEmbed'
import { MermaidBlock } from './components/MermaidBlock'
import { ZoomImage } from './components/ZoomImage'
import { LinkCard } from './components/link-cards/LinkCard'
import type { Root } from 'hast'
import type { Components, Jsx } from 'hast-util-to-jsx-runtime'
import type { JSX } from 'react'

export type MarkdownComponents = Partial<Components>

const ExternalLink = (props: JSX.IntrinsicElements['a']) => {
  const external = typeof props.href === 'string' && /^https?:/.test(props.href)
  // Link text always arrives through the props spread (hast children).
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...props}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    />
  )
}

// Tables keep their intrinsic width and scroll inside the wrapper on
// narrow screens (styles in markdown.css) instead of widening the page.
const ScrollableTable = (props: JSX.IntrinsicElements['table']) => (
  <div className="table-wrap">
    <table {...props} />
  </div>
)

const defaultComponents = {
  a: ExternalLink,
  table: ScrollableTable,
  'code-block': CodeBlock,
  'link-card': LinkCard,
  'media-embed': MediaEmbed,
  'mermaid-block': MermaidBlock,
  'zoom-image': ZoomImage,
} as MarkdownComponents

export interface MarkdownViewProps {
  /** hast root, or its JSON form as produced by the renderMarkdown server fn */
  tree: Root | string
  components?: MarkdownComponents
  className?: string
}

/**
 * Renders a server-produced hast tree to React. Custom hast elements
 * (code-block, mermaid-block, link-card, media-embed, ...) resolve through
 * the component registry; pass `components` to extend or override it.
 */
export const MarkdownView = ({
  tree,
  components,
  className,
}: MarkdownViewProps) => {
  // Two stages so an unstable `components` object only re-runs the JSX
  // conversion, never the JSON.parse of the full tree.
  const root = useMemo(
    (): Root => (typeof tree === 'string' ? JSON.parse(tree) : tree),
    [tree],
  )
  const content = useMemo(
    () =>
      toJsxRuntime(root, {
        Fragment,
        jsx: jsx as Jsx,
        jsxs: jsxs as Jsx,
        development: false,
        components: { ...defaultComponents, ...components },
      }),
    [root, components],
  )
  return (
    <div className={cn('markdown-body prose max-w-none', className)}>
      {content}
    </div>
  )
}
