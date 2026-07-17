import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRawEngine } from 'shiki/engine/javascript'
import type { HighlighterCore } from 'shiki/core'

export const SHIKI_THEMES = {
  light: 'catppuccin-latte',
  dark: 'catppuccin-mocha',
} as const

let highlighterPromise: Promise<HighlighterCore> | undefined

/** Unknown or unloaded languages fall back to plain text. */
export const resolveLoadedLang = (
  highlighter: HighlighterCore,
  lang: string,
): string => (highlighter.getLoadedLanguages().includes(lang) ? lang : 'text')

/** Standalone highlight → HTML string (dual-theme), e.g. for file cards. */
export const highlightToHtml = async (
  code: string,
  lang: string,
): Promise<string> => {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang: resolveLoadedLang(highlighter, lang),
    themes: SHIKI_THEMES,
    defaultColor: false,
  })
}

/**
 * Server-only singleton. Precompiled grammars + the raw JS engine avoid
 * WASM and on-the-fly regex compilation, keeping the Workers bundle small.
 * Add languages here as needed (and alias them in languages.ts).
 */

export const getHighlighter = (): Promise<HighlighterCore> => {
  highlighterPromise ??= createHighlighterCore({
    themes: [
      import('@shikijs/themes/catppuccin-latte'),
      import('@shikijs/themes/catppuccin-mocha'),
    ],
    langs: [
      import('@shikijs/langs-precompiled/c'),
      import('@shikijs/langs-precompiled/cpp'),
      import('@shikijs/langs-precompiled/javascript'),
      import('@shikijs/langs-precompiled/typescript'),
      import('@shikijs/langs-precompiled/jsx'),
      import('@shikijs/langs-precompiled/tsx'),
      import('@shikijs/langs-precompiled/json'),
      import('@shikijs/langs-precompiled/css'),
      import('@shikijs/langs-precompiled/html'),
      import('@shikijs/langs-precompiled/shellscript'),
      import('@shikijs/langs-precompiled/python'),
      import('@shikijs/langs-precompiled/rust'),
      import('@shikijs/langs-precompiled/go'),
      import('@shikijs/langs-precompiled/yaml'),
      import('@shikijs/langs-precompiled/toml'),
      import('@shikijs/langs-precompiled/markdown'),
      import('@shikijs/langs-precompiled/sql'),
      import('@shikijs/langs-precompiled/diff'),
      import('@shikijs/langs-precompiled/docker'),
    ],
    engine: createJavaScriptRawEngine(),
  })
  return highlighterPromise
}
