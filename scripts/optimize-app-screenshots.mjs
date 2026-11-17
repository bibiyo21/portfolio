// Converts the demo-data application screenshots into optimised 1440px-wide WebP files for the portfolio.
// Uses Chromium's canvas encoder, so no extra dependency is needed. Output: public/images/projects.
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const root = '/Users/ibrahemsotejo/Documents/Projects'
const N = `${root}/nutridense-inventory-system/portfolio-screenshots`
const S = `${root}/samsung-s-connect-integration/portfolio/screenshots`
const out = (n) => `public/images/projects/${n}.webp`

const jobs = [
  { from: `${N}/03-daily-inventory-report.png`, to: out('nutridense-inventory-report') },
  { from: `${N}/06-productions.png`, to: out('nutridense-productions') },
  { from: `${N}/07-new-production.png`, to: out('nutridense-new-production') },
  { from: `${N}/08-receive-materials.png`, to: out('nutridense-receive-materials') },
  { from: `${N}/12-purchase-orders.png`, to: out('nutridense-purchase-orders') },
  { from: `${S}/purchase-orders.png`, to: out('sconnect-purchase-orders') },
  { from: `${S}/purchase-order-edit.png`, to: out('sconnect-purchase-order-edit') },
  { from: `${S}/product-catalogue.png`, to: out('sconnect-product-catalogue') },
  { from: `${S}/imei-returns.png`, to: out('sconnect-imei-returns') },
  { from: `${S}/imei-return-form.png`, to: out('sconnect-imei-return-form') },
].map((j) => ({ ...j, width: 1440, quality: 0.82 }))

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
