// Builds the site's text face, Noto Sans CJK, as unicode-range woff2
// slices plus a stylesheet, into the gitignored generated/ folder that
// @planet/theme/fonts.css points at.
//
// Noto Sans has one family per CJK region (SC, TC, HK, JP, KR) with the
// region's glyph shapes; theme.css picks one by lang. This downloads each
// region's variable font from google/fonts at a pinned commit, checks it
// against the pinned SHA-256, and subsets it with HarfBuzz, keeping the
// weight axis: every slice is one variable face covering 100-900. Slices
// follow Google Fonts' frequency-ordered unicode-range split for the same
// family (slices.json), so a page only fetches the few slices its text
// touches.
//
// One change to the glyphs themselves: full-width glyphs (Han, kana,
// Hangul, CJK punctuation) get a wider advance, see track(). Noto draws
// them larger in the em than MiSans, the site's previous face, so
// unchanged they set tighter; letter-spacing can't do this in CSS without
// also loosening Latin, which already matches.
//
// Downloads and output are cached: a rerun with unchanged settings exits
// at once.
//
//   node scripts/build-fonts.mjs

import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { availableParallelism } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import fontverter from 'fontverter'
import subsetFont from 'subset-font'

// google/fonts commit the files are taken from
const COMMIT = '6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec'
const REGIONS = {
  SC: 'a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da',
  TC: '864727d210d54f2537bbe23b3a839436c3992af72de9322af5270897246bd44f',
  HK: '76098ee78ec234cd4f8c950742b3f766fea2f8b43d5180d901048f4fc86c6849',
  JP: 'c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f',
  KR: '194018e6b2b293a7964f037b25c0249ce1418bc9ab3c971060a03aa57861e252',
}
// Extra advance for full-width glyphs, in em. Measured: the gap between
// two Han glyphs is 0.118 em in MiSans and 0.075 em in Noto, at every
// weight.
const TRACKING = 0.042

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = join(root, 'node_modules/.cache/noto-sans')
const outDir = join(root, 'generated')
const slicesFile = join(root, 'scripts/slices.json')

const stamp = createHash('sha256')
  .update(
    JSON.stringify({ COMMIT, REGIONS, TRACKING, format: 4 }) +
      readFileSync(slicesFile, 'utf8'),
  )
  .digest('hex')
const stampFile = join(outDir, '.stamp')
if (existsSync(stampFile) && readFileSync(stampFile, 'utf8') === stamp) {
  console.log('noto-sans: up to date')
  process.exit(0)
}

const allSlices = JSON.parse(readFileSync(slicesFile, 'utf8'))
mkdirSync(cacheDir, { recursive: true })

const sha256 = buf => createHash('sha256').update(buf).digest('hex')

async function download(region, expected) {
  const name = `NotoSans${region}[wght].ttf`
  const file = join(cacheDir, `${COMMIT.slice(0, 12)}-${name}`)
  if (existsSync(file)) {
    const buf = readFileSync(file)
    if (sha256(buf) === expected) return buf
  }
  const url = `https://raw.githubusercontent.com/google/fonts/${COMMIT}/ofl/notosans${region.toLowerCase()}/${encodeURIComponent(name)}`
  console.log(`noto-sans: downloading ${name}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const actual = sha256(buf)
  if (actual !== expected) {
    throw new Error(`${name}: SHA-256 ${actual}, expected ${expected}`)
  }
  writeFileSync(file, buf)
  return buf
}

// "U+4e00-4e05, U+4e07" → code points
function codePoints(ranges) {
  const cps = []
  for (const part of ranges.split(',')) {
    const [a, b = a] = part.trim().slice(2).split('-')
    for (let cp = parseInt(a, 16); cp <= parseInt(b, 16); cp++) cps.push(cp)
  }
  return cps
}

// Adds TRACKING to the advance of every full-width glyph (advance = 1 em)
// of a TrueType font, after the glyph, like CSS letter-spacing does. The
// variable advances (HVAR) are deltas on top, so every weight follows.
function track(ttf) {
  const font = Buffer.from(ttf)
  const numTables = font.readUInt16BE(4)
  const tables = {}
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16
    tables[font.toString('latin1', rec, rec + 4)] = {
      rec,
      offset: font.readUInt32BE(rec + 8),
      length: font.readUInt32BE(rec + 12),
    }
  }
  const { head, hhea, hmtx } = tables
  const upem = font.readUInt16BE(head.offset + 18)
  const extra = Math.round(TRACKING * upem)
  const numberOfHMetrics = font.readUInt16BE(hhea.offset + 34)
  // Glyphs past numberOfHMetrics share the last advance, so they follow it
  for (let i = 0; i < numberOfHMetrics; i++) {
    const at = hmtx.offset + i * 4
    if (font.readUInt16BE(at) === upem) font.writeUInt16BE(upem + extra, at)
  }
  const maxAt = hhea.offset + 10
  font.writeUInt16BE(Math.max(font.readUInt16BE(maxAt), upem + extra), maxAt)
  // Table checksums, then the whole-font adjustment in head
  // Sum of big-endian uint32s, the last one zero-padded
  const checksum = (start, length) => {
    let sum = 0
    for (let i = 0; i < length; i += 4) {
      const word = Buffer.alloc(4)
      font.copy(word, 0, start + i, Math.min(start + i + 4, start + length))
      sum = (sum + word.readUInt32BE(0)) >>> 0
    }
    return sum
  }
  font.writeUInt32BE(0, head.offset + 8)
  for (const { rec, offset, length } of [hhea, hmtx, head]) {
    font.writeUInt32BE(checksum(offset, length), rec + 4)
  }
  font.writeUInt32BE(
    (0xb1b0afba - checksum(0, font.length)) >>> 0,
    head.offset + 8,
  )
  return font
}

// Runs fn over items with at most n in flight
async function pool(items, n, fn) {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (queue.length) await fn(queue.shift())
    }),
  )
}

const tmpDir = `${outDir}.tmp`
rmSync(tmpDir, { recursive: true, force: true })
mkdirSync(tmpDir, { recursive: true })

const css = []
for (const [region, expected] of Object.entries(REGIONS)) {
  const font = await download(region, expected)
  const family = `Noto Sans ${region}`
  const jobs = allSlices[region]
  const faces = new Map()
  console.log(`noto-sans: ${family}, ${jobs.length} slices`)
  await pool(jobs, availableParallelism(), async ({ name, ranges }) => {
    const text = String.fromCodePoint(...codePoints(ranges))
    const ttf = await subsetFont(font, text, { targetFormat: 'sfnt' })
    const woff2 = await fontverter.convert(track(ttf), 'woff2')
    // A slice the font has no glyphs for still carries .notdef; skip it
    if (woff2.length < 1500) return
    const file = `noto-sans-${region.toLowerCase()}-${name}.woff2`
    writeFileSync(join(tmpDir, file), woff2)
    faces.set(name, { file, ranges })
  })
  // Keep slices.json order, so the CSS is stable across runs
  for (const { name } of jobs) {
    const face = faces.get(name)
    if (!face) continue
    css.push(
      `@font-face{font-family:'${family}';font-style:normal;font-weight:100 900;font-display:swap;src:url(./${face.file}) format('woff2');unicode-range:${face.ranges}}`,
    )
  }
}

writeFileSync(
  join(tmpDir, 'fonts.css'),
  `/* Generated by scripts/build-fonts.mjs from Noto Sans CJK (google/fonts ${COMMIT.slice(0, 12)}, SIL OFL 1.1). Do not edit. */\n${css.join('\n')}\n`,
)
writeFileSync(join(tmpDir, '.stamp'), stamp)
rmSync(outDir, { recursive: true, force: true })
renameSync(tmpDir, outDir)
const files = readdirSync(outDir).filter(f => f.endsWith('.woff2'))
console.log(`noto-sans: wrote ${files.length} slices to generated/`)
