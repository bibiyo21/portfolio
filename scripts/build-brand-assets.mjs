// Generates the three logo concepts, light/dark variants and favicon assets as plain SVG/PNG/ICO.
// Wordmarks are converted to outlines with opentype.js so the SVGs do not depend on installed fonts.
// Output: docs/brand-preview/{concepts,favicons}. Nothing in public/ or src/ is touched.
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const require = createRequire(import.meta.url)
const opentype = require('opentype.js')
const OUT = join('docs', 'brand-preview')
mkdirSync(join(OUT, 'concepts'), { recursive: true })
mkdirSync(join(OUT, 'favicons'), { recursive: true })

const loadFont = (path) => {
  const b = readFileSync(path)
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength))
}
const grotesk = (w) => loadFont(`node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-${w}-normal.woff`)
const mono = loadFont('node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff')
const g600 = grotesk(600)
const g700 = grotesk(700)

const C = { burgundy: '#581C35', dark: '#3D1426', peach: '#F5C6AD', soft: '#FBE5D9', ivory: '#FFF8F2', ink: '#252126' }
// Role colours per background. `main` carries the mark, `text` the wordmark, `accent` the small highlight.
const palette = {
  light: { main: C.burgundy, deep: C.dark, text: C.ink, accent: C.peach, bg: C.ivory },
  dark: { main: C.peach, deep: C.soft, text: C.ivory, accent: C.peach, bg: C.dark },
}

const f = (n) => Number(n.toFixed(2))
const textPath = (font, text, x, y, size, ls = 0) => {
  const p = font.getPath(text, x, y, size, { letterSpacing: ls })
  return p.toPathData(2)
}
const textWidth = (font, text, size, ls = 0) => font.getAdvanceWidth(text, size, { letterSpacing: ls }) - (ls ? ls * size : 0)

// ---------- Concept A: IS monogram on one shared grid (64 x 64) ----------
// A straight I and a stepped S with rounded corners (so it cannot be read as a 5) share the same cap height,
// stroke weight and gap. The S's bottom bar runs right up to the I's edge, so the two letters nest on one
// baseline. Overlapping versions were tried and read as TS, JS, LS or $, so the letters stay separate.
function symbolA(v, id, { sw = 9, gap = 3.4, r = 8 } = {}) {
  const x0 = 10
  const Lc = x0 + sw + gap + sw / 2 // centre of the S's left vertical
  const Rc = Lc + 18 // centre of the S's right vertical
  const T = 8 + sw / 2
  const B = 56 - sw / 2
  const M = (T + B) / 2
  const R = Rc + sw / 2
  const d = [
    `M ${f(R)} ${f(T)}`, `H ${f(Lc + r)}`, `A ${r} ${r} 0 0 0 ${f(Lc)} ${f(T + r)}`,
    `V ${f(M - r)}`, `A ${r} ${r} 0 0 0 ${f(Lc + r)} ${f(M)}`,
    `H ${f(Rc - r)}`, `A ${r} ${r} 0 0 1 ${f(Rc)} ${f(M + r)}`,
    `V ${f(B - r)}`, `A ${r} ${r} 0 0 1 ${f(Rc - r)} ${f(B)}`,
    `H ${f(x0 + sw + gap)}`,
  ].join(' ')
  return `<path fill="none" stroke="${v.main}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="butt" d="${d}"/>
  <rect x="${x0}" y="8" width="${sw}" height="48" fill="${v.main}"/>`
}

// ---------- Concept B: architecture layers ----------
function symbolB(v) {
  const [a, b, c] = v === palette.light ? [C.dark, C.burgundy, '#6E2542'] : [C.peach, C.soft, '#E7B79E']
  return `<rect x="6" y="9" width="38" height="11" rx="3" fill="${a}"/>
  <rect x="20" y="26.5" width="38" height="11" rx="3" fill="${b}"/>
  <rect x="6" y="44" width="38" height="11" rx="3" fill="${c}"/>
  <rect x="30.5" y="20" width="3" height="6.5" fill="${v.main}"/>
  <rect x="30.5" y="37.5" width="3" height="6.5" fill="${v.main}"/>
  <circle cx="52" cy="14.5" r="4" fill="${v.accent}" ${v === palette.light ? `stroke="${C.burgundy}" stroke-width="1.5"` : ''}/>`
}

// ---------- Concept C: typographic IS ----------
function compactC(v) {
  const size = 46
  const i = textPath(g700, 'I', 0, 0, size)
  const s = textPath(g700, 'S', 0, 0, size)
  const wi = g700.getAdvanceWidth('I', size)
  const ws = g700.getAdvanceWidth('S', size)
  const total = wi + ws - 1
  const x = (64 - total) / 2
  return `<path transform="translate(${f(x)} 46)" d="${i}" fill="${v.text}"/>
  <path transform="translate(${f(x + wi - 1)} 46)" d="${s}" fill="${v.main}"/>
  <rect x="${f(x + 1)}" y="52" width="${f(total - 2)}" height="3" rx="1.5" fill="${v.accent}"/>`
}

const svgDoc = (w, h, inner, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" width="${f(w)}" height="${f(h)}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>`

const symbols = {
  a: { name: 'Interlocking monogram', fn: (v, id) => symbolA(v, id) },
  b: { name: 'Architecture layers', fn: symbolB },
  c: { name: 'Typographic IS', fn: compactC },
}

// Horizontal lockup: symbol + "Ibrahem Sotejo" + mono descriptor.
function horizontal(key, v, id) {
  const size = 22
  const name = 'Ibrahem Sotejo'
  const desc = 'SOLUTIONS ARCHITECT'
  const sym = symbols[key].fn(v, id)
  const tx = 64 + 12
  const wName = textWidth(g600, name, size)
  const wDesc = textWidth(mono, desc, 7.4, 0.16)
  const w = tx + Math.max(wName, wDesc) + 2
  return svgDoc(
    w,
    64,
    `<g>${sym}</g>
  <path d="${textPath(g600, name, tx, 30, size)}" fill="${v.text}"/>
  <path d="${textPath(mono, desc, tx, 46, 7.4, 0.16)}" fill="${v === palette.light ? C.burgundy : C.peach}"/>`,
    `Ibrahem Sotejo, Solutions Architect`,
  )
}

// Concept C wordmark: tracked capitals, initials in the brand colour, thin peach rule.
function wordmarkC(v) {
  const text = 'IBRAHEM SOTEJO'
  const size = 26
  const ls = 0.16
  let x = 0
  let inner = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const adv = g600.getAdvanceWidth(ch, size) + ls * size
    if (ch !== ' ') {
      const initial = i === 0 || i === 8
      inner += `<path d="${textPath(g600, ch, x, 30, size)}" fill="${initial ? v.main : v.text}"/>`
    }
    x += adv
  }
  const w = x - ls * size
  inner += `<rect x="0" y="42" width="${f(w)}" height="2" fill="${v.accent}"/><rect x="0" y="42" width="30" height="2" fill="${v.main}"/>`
  inner += `<path d="${textPath(mono, 'SOLUTIONS ARCHITECT', 0, 60, 7.4, 0.16)}" fill="${v === palette.light ? C.burgundy : C.peach}"/>`
  return svgDoc(w, 64, inner, 'Ibrahem Sotejo, Solutions Architect')
}

const written = []
const put = (rel, content) => { writeFileSync(join(OUT, rel), content); written.push(rel) }

for (const [variant, v] of Object.entries(palette)) {
  for (const key of ['a', 'b', 'c']) {
    put(`concepts/concept-${key}-symbol-${variant}.svg`, svgDoc(64, 64, symbols[key].fn(v, `${key}${variant}s`), `${symbols[key].name} symbol`))
    put(`concepts/concept-${key}-horizontal-${variant}.svg`, key === 'c' ? wordmarkC(v) : horizontal(key, v, `${key}${variant}h`))
  }
}

// ---------- Favicons: tile + simplified glyph, derived from each concept ----------
function faviconInner(key, tile, glyph, id) {
  if (key === 'a') {
    return `<g transform="translate(2.6 5.2) scale(.84)">${symbolA({ main: glyph, deep: glyph }, id, { sw: 11, gap: 4, r: 9 })}</g>`
  }
  if (key === 'b') {
    return `<rect x="12" y="13" width="26" height="9" rx="2" fill="${glyph}"/><rect x="26" y="27.5" width="26" height="9" rx="2" fill="${glyph}" opacity=".75"/><rect x="12" y="42" width="26" height="9" rx="2" fill="${glyph}"/>`
  }
  const size = 38
  const wi = g700.getAdvanceWidth('I', size)
  const ws = g700.getAdvanceWidth('S', size)
  const total = wi + ws - 1
  const x = (64 - total) / 2
  return `<path transform="translate(${f(x)} 46)" d="${textPath(g700, 'I', 0, 0, size)}" fill="${glyph}"/><path transform="translate(${f(x + wi - 1)} 46)" d="${textPath(g700, 'S', 0, 0, size)}" fill="${glyph}"/>`
}
function faviconSvg(key, { scheme = 'both', rounded = true } = {}) {
  const r = rounded ? 14 : 0
  const id = `fav${key}`
  const light = { tile: C.burgundy, glyph: C.peach }
  const dark = { tile: C.peach, glyph: C.dark }
  const style =
    scheme === 'both'
      ? `<style>.t{fill:${light.tile}}.g{color:${light.glyph}}@media (prefers-color-scheme:dark){.t{fill:${dark.tile}}.g{color:${dark.glyph}}}</style>`
      : ''
  const col = scheme === 'dark' ? dark : light
  const glyphColor = scheme === 'both' ? 'currentColor' : col.glyph
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${style}<rect class="t" width="64" height="64" rx="${r}" fill="${col.tile}"/><g class="g">${faviconInner(key, col.tile, glyphColor, id)}</g></svg>`
}
for (const key of ['a', 'b', 'c']) {
  put(`favicons/favicon-${key}.svg`, faviconSvg(key))
  put(`favicons/favicon-${key}-light.svg`, faviconSvg(key, { scheme: 'light' }))
  put(`favicons/favicon-${key}-dark.svg`, faviconSvg(key, { scheme: 'dark' }))
}

// PNGs (light scheme) and an ICO built from them.
const browser = await chromium.launch()
const sizes = { 16: 'favicon-16.png', 32: 'favicon-32.png', 48: 'favicon-48.png', 180: 'apple-touch-icon.png', 192: 'icon-192.png', 512: 'icon-512.png' }
async function renderPng(svg, size) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
  const buf = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } })
  await page.close()
  return buf
}
function buildIco(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4)
  let offset = 6 + pngs.length * 16
  const dir = []
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size === 256 ? 0 : size, 0); e.writeUInt8(size === 256 ? 0 : size, 1)
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12)
    dir.push(e); offset += buf.length
  }
  return Buffer.concat([header, ...dir, ...pngs.map((p) => p.buf)])
}
for (const key of ['a', 'b', 'c']) {
  const icoParts = []
  for (const [size, file] of Object.entries(sizes)) {
    const s = Number(size)
    // The Apple touch icon is square: iOS applies its own rounding.
    const svg = faviconSvg(key, { scheme: 'light', rounded: s !== 180 })
    const buf = await renderPng(svg, s)
    const name = file.replace(/^(favicon|apple-touch-icon|icon)/, (m) => `${m}-${key}`)
    put(`favicons/${name}`, buf)
    if (s <= 48) icoParts.push({ size: s, buf })
    // Dark-scheme 16/32 previews, used by the review page to show the tab on dark browser themes.
    if (s === 16 || s === 32) put(`favicons/favicon-${key}-dark-${s}.png`, await renderPng(faviconSvg(key, { scheme: 'dark' }), s))
  }
  put(`favicons/favicon-${key}.ico`, buildIco(icoParts))
}
await browser.close()
console.log(`Wrote ${written.length} files to ${OUT}`)
