// Converts the real GTI screenshots captured by `npm run capture:gti` into optimised WebP files for the portfolio.
// Uses Chromium's canvas encoder, so no extra dependency is needed. Source: docs/gti-site-previews. Output: public/images/projects.
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const jobs = []
for (const site of ['main', 'north']) {
  const src = (n) => `docs/gti-site-previews/${site}/${n}.png`
  const out = (n) => `public/images/projects/gti-${site}-${n}.webp`
  jobs.push({ from: src('desktop-viewport'), to: out('desktop'), width: 1440, quality: 0.82 })
  jobs.push({ from: src('desktop-viewport'), to: out('desktop-720'), width: 720, quality: 0.82 })
  jobs.push({ from: src('mobile-viewport'), to: out('mobile'), width: 390, quality: 0.85 })
  jobs.push({ from: src('desktop-full-page'), to: out('desktop-full'), width: 1200, quality: 0.78 })
  jobs.push({ from: src('mobile-full-page'), to: out('mobile-full'), width: 390, quality: 0.8 })
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<canvas id="c"></canvas>')
for (const j of jobs) {
  const b64 = readFileSync(j.from).toString('base64')
  const result = await page.evaluate(async ({ b64: data, width, quality }) => {
    const img = new Image()
    img.src = `data:image/png;base64,${data}`
    await img.decode()
    const scale = Math.min(1, width / img.naturalWidth)
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    const c = document.getElementById('c')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, w, h)
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', quality))
    const buf = new Uint8Array(await blob.arrayBuffer())
    let s = ''
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000))
    return { w, h, data: btoa(s) }
  }, { b64, width: j.width, quality: j.quality })
  writeFileSync(j.to, Buffer.from(result.data, 'base64'))
  console.log(`${j.to}  ${result.w}x${result.h}  ${(statSync(j.to).size / 1024).toFixed(0)} kB`)
}
await browser.close()
