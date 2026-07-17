import {
  siCss,
  siDocker,
  siGnubash,
  siGo,
  siHtml5,
  siJavascript,
  siJson,
  siMarkdown,
  siMermaid,
  siPython,
  siReact,
  siRust,
  siToml,
  siTypescript,
  siYaml,
} from 'simple-icons'
import { LANG_ALIASES } from '@/lib/markdown/languages'

export interface LangInfo {
  label: string
  /** simple-icons svg path (24×24 viewBox); undefined → generic code icon */
  iconPath?: string
}

const LANGS: Record<string, LangInfo> = {
  c: { label: 'C' },
  cpp: { label: 'C++' },
  css: { label: 'CSS', iconPath: siCss.path },
  diff: { label: 'Diff' },
  docker: { label: 'Dockerfile', iconPath: siDocker.path },
  go: { label: 'Go', iconPath: siGo.path },
  html: { label: 'HTML', iconPath: siHtml5.path },
  javascript: { label: 'JavaScript', iconPath: siJavascript.path },
  json: { label: 'JSON', iconPath: siJson.path },
  jsx: { label: 'JSX', iconPath: siReact.path },
  markdown: { label: 'Markdown', iconPath: siMarkdown.path },
  mermaid: { label: 'Mermaid', iconPath: siMermaid.path },
  python: { label: 'Python', iconPath: siPython.path },
  rust: { label: 'Rust', iconPath: siRust.path },
  shellscript: { label: 'Shell', iconPath: siGnubash.path },
  sql: { label: 'SQL' },
  text: { label: 'Plain Text' },
  toml: { label: 'TOML', iconPath: siToml.path },
  tsx: { label: 'TSX', iconPath: siReact.path },
  typescript: { label: 'TypeScript', iconPath: siTypescript.path },
  yaml: { label: 'YAML', iconPath: siYaml.path },
}

/** Fence language id (as written, e.g. 'ts') → display label + logo. */
export const langInfo = (lang: string): LangInfo => {
  const id = lang.toLowerCase()
  const resolved = LANG_ALIASES[id] ?? id
  return LANGS[resolved] ?? { label: lang }
}
