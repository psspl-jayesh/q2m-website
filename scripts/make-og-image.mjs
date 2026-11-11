// Generates the default Open Graph image (1200x630) from the brand kit: reverse logo, black slab, one blue dot arrow,
// and the tagline in Sora Bold (converted to outlines so the exact brand font is used without installing it).
//   output: public/brand/og-default.png
import sharp from 'sharp'
import opentype from 'opentype.js'
import { readFileSync, writeFileSync } from 'node:fs'

const W = 1200, H = 630
const TAGLINE = ['Enterprise AI', 'Development Company', 'in India']
const BLACK = '#000000', WHITE = '#ffffff', BLUE = '#0075ea'

const font = opentype.parse(readFileSync('node_modules/@fontsource/sora/files/sora-latin-700-normal.woff').buffer.slice(0))
// text to outlines
const SIZE = 78, LINE = 92, X = 72
let y = 330
const paths = TAGLINE.map((line) => {
  const d = font.getPath(line, X, y, SIZE).toPathData(2)
  y += LINE
  return `<path d="${d}" fill="${WHITE}"/>`
}).join('')

// brand dot arrow (same row layout as src/components/DotArrow.tsx): pitch 24, dot diameter = half the pitch
const ROWS = [[4, 8], [3, 8], [2, 8], [1, 8], [0, 8], [4, 7], [4, 6], [4, 5], [4, 4]]
const pitch = 24
const ox = W - 9 * pitch - 72, oy = 72
const dots = ROWS.flatMap(([a, b], r) => Array.from({ length: b - a + 1 }, (_, i) => `<circle cx="${ox + (a + i) * pitch + pitch / 2}" cy="${oy + r * pitch + pitch / 2}" r="${pitch / 4}" fill="${BLUE}"/>`)).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${BLACK}"/>${dots}${paths}</svg>`
const logo = await sharp('Q2M_Brand_Kit/Logos/Q2M_Logo_Reverse_Transparent.png').resize({ width: 220 }).toBuffer()
await sharp(Buffer.from(svg)).composite([{ input: logo, left: 64, top: 56 }]).png({ compressionLevel: 9 }).toFile('public/brand/og-default.png')
const m = await sharp('public/brand/og-default.png').metadata()
console.log('og-default.png', m.width + 'x' + m.height)
