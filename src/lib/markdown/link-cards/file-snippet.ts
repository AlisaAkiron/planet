import { LANG_ALIASES } from '../languages.ts'
import { highlightToHtml } from '../shiki.ts'
import type { CardMeta } from './types.ts'

export const langForFile = (path: string): string => {
  const name = path.split('/').pop()?.toLowerCase() ?? ''
  if (name === 'dockerfile') return 'docker'
  const ext = name.includes('.') ? (name.split('.').pop() ?? '') : ''
  return LANG_ALIASES[ext] ?? 'text'
}

/** '#L10-L20' (GitHub) / '#L10-20' (GitLab) → line range for ParsedCard info. */
const LINE_HASH = /^L(\d+)(?:-L?(\d+))?$/

export const parseLineRange = (
  hash: string,
): { lineStart: string; lineEnd?: string } | null => {
  const match = LINE_HASH.exec(hash)
  if (!match) return null
  return match[2]
    ? { lineStart: match[1], lineEnd: match[2] }
    : { lineStart: match[1] }
}

const MAX_PREVIEW_LINES = 30
const MAX_RANGE_LINES = 200

/**
 * Raw file text → highlighted snippet for a file card. A #L range from the
 * URL selects exactly those lines (capped); otherwise the first
 * MAX_PREVIEW_LINES lines are shown with shown/total counts in extra.
 */
export const buildFileSnippet = async (
  raw: string,
  filePath: string,
  info: Record<string, string>,
): Promise<Pick<CardMeta, 'codeHtml' | 'extra'>> => {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n')
  const extra: Record<string, string> = {}
  let selected: string[]

  if (info.lineStart) {
    const start = Math.max(1, Number(info.lineStart))
    const requestedEnd = info.lineEnd ? Number(info.lineEnd) : start
    const end = Math.min(
      requestedEnd,
      start + MAX_RANGE_LINES - 1,
      lines.length,
    )
    selected = lines.slice(start - 1, end)
  } else if (lines.length > MAX_PREVIEW_LINES) {
    selected = lines.slice(0, MAX_PREVIEW_LINES)
    extra.shown = String(MAX_PREVIEW_LINES)
    extra.total = String(lines.length)
  } else {
    selected = lines
  }

  const codeHtml = await highlightToHtml(
    selected.join('\n'),
    langForFile(filePath),
  )
  return { codeHtml, extra }
}
