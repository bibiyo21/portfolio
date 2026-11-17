// Renders one 1200x630 social-share image per case study (public/images/projects/og-<slug>.jpg):
// the brand colours, the project title and a crop of its demo-data screenshot.
// Fonts are embedded as data URIs so the render does not depend on installed fonts.
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const b64 = (p) => readFileSync(p).toString('base64')
const font = (name, weight, file) =>
  `@font-face{font-family:${name};font-weight:${weight};src:url(data:font/woff2;base64,${b64(file)}) format('woff2')}`
const sg = (w) => `node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-${w}-normal.woff2`
const logo = b64('public/images/brand/logo-horizontal-dark.svg')

const studies = [
  { slug: 'nutridense-inventory', title: 'Nutridense Inventory System', sub: 'Laravel inventory system, reviewed', shot: 'nutridense-productions' },
  { slug: 'sconnect-integration', title: 'Samsung S Connect Integration', sub: 'Laravel API integration, reviewed', shot: 'sconnect-purchase-orders' },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
for (const s of studies) {
  const shot = b64(`public/images/projects/${s.shot}.webp`)
  await page.setContent(`<style>
${font('SG', 600, sg(600))}
${font('SG', 500, sg(500))}
${font('JB', 500, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2')}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;background:#3D1426;color:#FFF8F2;font-family:SG;position:relative;overflow:hidden}
.glow{position:absolute;right:-200px;top:-200px;width:700px;height:700px;border-radius:50%;background:#581C35;opacity:.7;filter:blur(40px)}
.text{position:absolute;left:72px;top:72px;width:470px;height:486px;display:flex;flex-direction:column}
.eyebrow{font-family:JB;font-weight:500;font-size:17px;letter-spacing:.14em;text-transform:uppercase;color:#F5C6AD}
h1{margin:26px 0 0;font-weight:600;font-size:56px;line-height:1.06;letter-spacing:-.02em}
p{margin:22px 0 0;font-weight:500;font-size:26px;line-height:1.3;color:#E9D3C8}
.logo{margin-top:auto;height:46px}
.card{position:absolute;left:590px;top:96px;width:690px;height:470px;border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 30px 80px rgba(0,0,0,.45)}
.card img{width:690px;display:block}
</style>
<div class="glow"></div>
<div class="text"><span class="eyebrow">Case study · Legacy project</span><h1>${s.title}</h1><p>${s.sub}</p>
<img class="logo" src="data:image/svg+xml;base64,${logo}" alt="" style="width:auto;align-self:flex-start"/></div>
<div class="card"><img src="data:image/webp;base64,${shot}" alt=""/></div>`)
  await page.evaluate(() => document.fonts.ready)
  const out = `public/images/projects/og-${s.slug}.jpg`
  writeFileSync(out, await page.screenshot({ type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } }))
  console.log(`${out}  ${(statSync(out).size / 1024).toFixed(0)} kB`)
}
await browser.close()
