// TEMP review helper (deleted after use): per route and theme, stack 390 / 1024 / 1440 full-page screenshots as columns-of-slices.
import sharp from 'sharp'
import { existsSync, mkdirSync } from 'node:fs'
const [theme, ...slugs] = process.argv.slice(2)
const OUT = 'C:/Users/JAYESH~1/AppData/Local/Temp/claude/049a98dfdc629ef0/22d539b4-b57d-4fff-a600-d3eb18b1bd72/scratchpad/montage'
mkdirSync(OUT, { recursive: true })
const COLH = 900
async function row(file, scale) {
  const meta = await sharp(file).metadata()
  const { data: buf, info } = await sharp(file).resize({ width: Math.round(meta.width * scale) }).toBuffer({ resolveWithObject: true })
  const w = info.width, h = info.height
  const cols = Math.ceil(h / COLH), parts = []
  for (let i = 0; i < cols; i++) parts.push({ input: await sharp(buf).extract({ left: 0, top: i * COLH, width: w, height: Math.min(COLH, h - i * COLH) }).toBuffer(), left: i * (w + 6), top: 0 })
  return { parts, width: cols * (w + 6), height: COLH }
}
for (const slug of slugs) {
  const rows = []
  for (const [w, sc] of [[390, 0.4], [1024, 0.22], [1440, 0.17]]) { const f = `H:/q2m-solution/docs/screenshots/${theme}/${w}/${slug}.jpg`; if (existsSync(f)) rows.push(await row(f, sc)) }
  const W = Math.max(...rows.map((r) => r.width)), H = rows.length * (COLH + 8)
  await sharp({ create: { width: W, height: H, channels: 3, background: '#888' } }).composite(rows.flatMap((r, i) => r.parts.map((p) => ({ ...p, top: i * (COLH + 8) })))).jpeg({ quality: 60 }).toFile(`${OUT}/${theme}__${slug}.jpg`)
  console.log(`${theme}__${slug}.jpg`, W + 'x' + H)
}
