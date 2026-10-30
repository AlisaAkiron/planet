/**
 * KaTeX output arrives from the server as an HTML string (rehype-math);
 * it is injected verbatim so neither SSR nor hydration walks KaTeX's
 * nested spans. Display math replaced a <pre>, so it gets a block wrapper;
 * inline math sits inside a paragraph, so it stays a <span>.
 */
export const KatexMath = ({
  mode = 'inline',
  html = '',
}: {
  mode?: 'display' | 'inline'
  /** KaTeX renderToString output — KaTeX escapes all content */
  html?: string
}) =>
  mode === 'display' ? (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  )
