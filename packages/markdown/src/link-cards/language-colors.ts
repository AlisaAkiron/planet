import type { LanguageStat } from './types.ts'

/** GitHub linguist colors for common languages. */
const LANGUAGE_COLORS: Record<string, string> = {
  Assembly: '#6E4C13',
  Astro: '#ff5a03',
  C: '#555555',
  'C#': '#178600',
  'C++': '#f34b7d',
  CMake: '#DA3434',
  CSS: '#663399',
  Clojure: '#db5855',
  CoffeeScript: '#244776',
  Crystal: '#000100',
  Dart: '#00B4AB',
  Dockerfile: '#384d54',
  Elixir: '#6e4a7e',
  'Emacs Lisp': '#c065db',
  Erlang: '#B83998',
  'F#': '#b845fc',
  GLSL: '#5686a5',
  Go: '#00ADD8',
  HTML: '#e34c26',
  Haskell: '#5e5086',
  Java: '#b07219',
  JavaScript: '#f1e05a',
  Julia: '#a270ba',
  'Jupyter Notebook': '#DA5B0B',
  Kotlin: '#A97BFF',
  Lua: '#000080',
  MDX: '#fcb32c',
  Makefile: '#427819',
  Markdown: '#083fa1',
  Meson: '#007800',
  Nix: '#7e7eff',
  OCaml: '#ef7a08',
  'Objective-C': '#438eff',
  PHP: '#4F5D95',
  Perl: '#0298c3',
  PowerShell: '#012456',
  Python: '#3572A5',
  R: '#198CE7',
  Ruby: '#701516',
  Rust: '#dea584',
  SCSS: '#c6538c',
  Scala: '#c22d40',
  Shell: '#89e051',
  Solidity: '#AA6746',
  Svelte: '#ff3e00',
  Swift: '#F05138',
  TeX: '#3D6117',
  TypeScript: '#3178c6',
  'Vim Script': '#199f4b',
  Vue: '#41b883',
  Zig: '#ec915c',
}

const FALLBACK_COLOR = '#8b8b8b'

export const languageColor = (name: string) =>
  LANGUAGE_COLORS[name] ?? FALLBACK_COLOR

/**
 * Language shares → top-N stats with colors. Works for both GitHub's
 * byte counts and GitLab's percentages (any positive weights).
 */
export const toLanguageStats = (
  shares: Record<string, number> | null,
  topN = 4,
): LanguageStat[] => {
  if (!shares) return []
  const total = Object.values(shares).reduce((sum, value) => sum + value, 0)
  if (total <= 0) return []
  return Object.entries(shares)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, value]) => ({
      name,
      percent: Math.round((value / total) * 1000) / 10,
      color: languageColor(name),
    }))
}
