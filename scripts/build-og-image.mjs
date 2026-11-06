// Renders public/images/illustrations/og-image.png (1200x630) from the brand logo and tagline.
// Fonts are embedded as data URIs so the render does not depend on installed fonts or file access.
import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const b64 = (p) => readFileSync(p).toString('base64')
const font = (name, weight, file) =>
  `@font-face{font-family:${name};font-weight:${weight};src:url(data:font/woff2;base64,${b64(file)}) format('woff2')}`
const logo = b64('public/images/brand/logo-horizontal-dark.svg')
const sg = (w) => `node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-${w}-normal.woff2`

const html = `<style>
${font('SG', 600, sg(600))}
${font('SG', 500, sg(500))}
${font('JB', 500, 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2')}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;background:#3D1426;color:#FFF8F2;font-family:SG;position:relative;overflow:hidden}
.glow{position:absolute;right:-180px;top:-180px;width:640px;height:640px;border-radius:50%;background:#581C35;opacity:.7;filter:blur(40px)}
.ring{position:absolute;right:80px;bottom:-120px;width:360px;height:360px;border-radius:50%;border:2px solid rgba(245,198,173,.35)}
.ring.two{right:120px;bottom:-80px;width:280px;height:280px}
.wrap{position:relative;padding:72px 80px;height:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between}
img{height:84px;width:auto;display:block}
h1{margin:0;font-weight:600;font-size:74px;line-height:1.02;letter-spacing:-.03em}
h1 span{color:#F5C6AD}
p{margin:0;font-family:JB;font-weight:500;font-size:20px;letter-spacing:.12em;text-transform:uppercase;color:#F5C6AD;white-space:nowrap}
</style><div class="glow"></div><div class="ring"></div><div class="ring two"></div>
<div class="wrap"><img src="data:image/svg+xml;base64,${logo}"><h1>Architecting Systems.<br>Engineering Experiences.<br><span>Building Possibilities.</span></h1><p>Solutions Architect · Full-Stack Developer · Technology Enthusiast</p></div>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await page.screenshot({ path: 'public/images/illustrations/og-image.png' })
await browser.close()
console.log('Wrote public/images/illustrations/og-image.png')
