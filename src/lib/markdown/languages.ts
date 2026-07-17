/**
 * Fence aliases and file extensions → canonical shiki language ids. Shared
 * by the code-block header (lang-info) and file-card snippets so the two
 * can't drift. Keep in sync with the grammars loaded in shiki.ts.
 */
export const LANG_ALIASES: Record<string, string> = {
  bash: 'shellscript',
  c: 'c',
  cjs: 'javascript',
  cpp: 'cpp',
  css: 'css',
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
