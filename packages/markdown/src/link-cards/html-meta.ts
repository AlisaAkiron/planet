import { decodeHTML } from 'entities'

// One compile per og: property ever queried, not two per extractOg call.
const ogPatternCache = new Map<string, RegExp[]>()

const ogPatterns = (prop: string) => {
  let patterns = ogPatternCache.get(prop)
  if (!patterns) {
    patterns = [
      new RegExp(`<meta[^>]+property="og:${prop}"[^>]+content="([^"]*)"`, 'i'),
      new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="og:${prop}"`, 'i'),
    ]
    ogPatternCache.set(prop, patterns)
  }
  return patterns
}

/** <meta property="og:X" content="..."> extractor (attribute order tolerant). */
export const extractOg = (html: string, prop: string): string | undefined => {
  for (const pattern of ogPatterns(prop)) {
    const match = pattern.exec(html)
    if (match?.[1]) return decodeHTML(match[1])
  }
  return undefined
}

/** Strips tags, converting <br> to newlines. */
export const htmlToText = (html: string) =>
  decodeHTML(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim()
