/**
 * Fence aliases and file extensions → canonical shiki language ids. Shared
 * by the highlighter (shiki.ts), the code-block header (lang-info) and
 * file-card snippets so they can't drift. Canonical ids must have a
 * grammar loader in shiki.ts.
 */
export const LANG_ALIASES: Record<string, string> = {
  bash: 'shellscript',
  c: 'c',
  'c++': 'cpp',
  cjs: 'javascript',
  cpp: 'cpp',
  css: 'css',
  cts: 'typescript',
  diff: 'diff',
  dockerfile: 'docker',
  go: 'go',
  htm: 'html',
  html: 'html',
  js: 'javascript',
  json: 'json',
  jsonc: 'json',
  jsx: 'jsx',
  markdown: 'markdown',
  md: 'markdown',
  mjs: 'javascript',
  mts: 'typescript',
  patch: 'diff',
  py: 'python',
  rs: 'rust',
  sh: 'shellscript',
  shell: 'shellscript',
  sql: 'sql',
  toml: 'toml',
  ts: 'typescript',
  tsx: 'tsx',
  txt: 'text',
  yaml: 'yaml',
  yml: 'yaml',
  zsh: 'shellscript',
}
