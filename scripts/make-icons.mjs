// Generates favicon sizes and the apple-touch-icon from the existing q2m-icon.svg (kept as the primary favicon).
//   input : public/images/shared/q2m-icon.svg
//   output: public/favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, favicon.ico (16+32+48), apple-touch-icon.png (180x180),
//           icon-192.png, icon-512.png
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = 'public/images/shared/q2m-icon.svg'
const svg = readFileSync(SRC)
const render = (size, { pad = 0, bg } = {}) => sharp(svg, { density: 1200 })
  .resize({ width: size - pad * 2, height: size - pad * 2, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
for (const s of [16, 32, 48]) await render(s).toFile(`public/favicon-${s}x${s}.png`)
// iOS does not support transparency: white background with breathing room
await render(180, { pad: 28, bg: { r: 255, g: 255, b: 255, alpha: 1 } }).toFile('public/apple-touch-icon.png')
await render(192, { pad: 24, bg: { r: 255, g: 255, b: 255, alpha: 1 } }).toFile('public/icon-192.png')
await render(512, { pad: 64, bg: { r: 255, g: 255, b: 255, alpha: 1 } }).toFile('public/icon-512.png')
// favicon.ico with PNG-encoded 16/32/48 images
const pngs = await Promise.all([16, 32, 48].map((s) => render(s).toBuffer()))
const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4)
let offset = 6 + 16 * pngs.length
const dir = pngs.map((b, i) => { const e = Buffer.alloc(16); const s = [16, 32, 48][i]; e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(b.length, 8); e.writeUInt32LE(offset, 12); offset += b.length; return e })
writeFileSync('public/favicon.ico', Buffer.concat([head, ...dir, ...pngs]))
console.log('icons written')
