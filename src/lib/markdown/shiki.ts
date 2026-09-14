import { createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import { LANG_ALIASES } from './languages.ts'
import type {
  HighlighterCore,
  LanguageRegistration,
  WebAssemblyInstance,
} from 'shiki/core'

export const SHIKI_THEMES = {
  light: 'catppuccin-latte',
  dark: 'catppuccin-mocha',
} as const

type LangLoader = () => Promise<{ default: LanguageRegistration[] }>

/**
 * Grammars available to the highlighter, keyed by canonical shiki id.
 * Nothing here is loaded until a document actually uses the language —
 * every grammar is a separate lazily-evaluated chunk (cpp alone is
 * >500 kB of JS to parse), so a post with one code fence pays for one
 * grammar, not nineteen. Aliases live in languages.ts.
 */
const LANG_LOADERS: Record<string, LangLoader> = {
  c: () => import('@shikijs/langs/c'),
  cpp: () => import('@shikijs/langs/cpp'),
  css: () => import('@shikijs/langs/css'),
  diff: () => import('@shikijs/langs/diff'),
  docker: () => import('@shikijs/langs/docker'),
  go: () => import('@shikijs/langs/go'),
  html: () => import('@shikijs/langs/html'),
  javascript: () => import('@shikijs/langs/javascript'),
  json: () => import('@shikijs/langs/json'),
  jsx: () => import('@shikijs/langs/jsx'),
  markdown: () => import('@shikijs/langs/markdown'),
  python: () => import('@shikijs/langs/python'),
  rust: () => import('@shikijs/langs/rust'),
  shellscript: () => import('@shikijs/langs/shellscript'),
  sql: () => import('@shikijs/langs/sql'),
  toml: () => import('@shikijs/langs/toml'),
  tsx: () => import('@shikijs/langs/tsx'),
  typescript: () => import('@shikijs/langs/typescript'),
  yaml: () => import('@shikijs/langs/yaml'),
}

/**
 * Fence label or file extension → canonical grammar id, or 'text' (shiki's
 * built-in plain language) when no grammar is available.
 */
export const resolveLang = (lang: string): string => {
  const canonical = LANG_ALIASES[lang] ?? lang
  return Object.prototype.hasOwnProperty.call(LANG_LOADERS, canonical)
    ? canonical
    : 'text'
}

let highlighterPromise: Promise<HighlighterCore> | undefined

/**
 * Server-only singleton: themes + the Oniguruma engine, no grammars. The
 * WASM engine compiles a grammar's regexes several times cheaper than V8
 * does for the JS engine, which matters here because every fresh isolate
 * starts with nothing compiled. Workers can't compile WASM from bytes at
 * runtime, so the binary is imported as a module (the Cloudflare Vite
 * plugin hands it over as a precompiled WebAssembly.Module).
 */
const getHighlighter = (): Promise<HighlighterCore> => {
  highlighterPromise ??= createHighlighterCore({
    themes: [
      import('@shikijs/themes/catppuccin-latte'),
      import('@shikijs/themes/catppuccin-mocha'),
    ],
    langs: [],
    engine: createOnigurumaEngine(async importObject => {
      const { default: wasm } = await import('shiki/onig.wasm')
      const instance = await WebAssembly.instantiate(wasm, importObject)
      return instance.exports as WebAssemblyInstance
    }),
  }).catch(error => {
    // Let the next render retry instead of pinning a failed init forever.
    highlighterPromise = undefined
    throw error
  })
  return highlighterPromise
}

const langLoads = new Map<string, Promise<void>>()

const loadLang = (highlighter: HighlighterCore, lang: string) => {
  let pending = langLoads.get(lang)
  if (!pending) {
    pending = highlighter.loadLanguage(LANG_LOADERS[lang]()).catch(error => {
      langLoads.delete(lang)
      throw error
    })
    langLoads.set(lang, pending)
  }
  return pending
}

/**
 * Highlight → dual-theme HTML string (`<pre class="shiki">…`). Loads the
 * grammar on first use. Serialized HTML, not hast: the string crosses the
 * RPC boundary and the KV cache as one value, and React SSR/hydration
 * treats it as opaque instead of walking a span per token.
 */
export const highlightToHtml = async (
  code: string,
  lang: string,
): Promise<string> => {
  const highlighter = await getHighlighter()
  const resolved = resolveLang(lang)
  if (resolved !== 'text') await loadLang(highlighter, resolved)
  return highlighter.codeToHtml(code, {
    lang: resolved,
    themes: SHIKI_THEMES,
    defaultColor: false,
  })
}
