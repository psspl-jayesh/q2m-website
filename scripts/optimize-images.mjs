// Builds responsive AVIF + WebP variants of every synced image. Never upscales: variants stop at the source width.
// Input : public/images/**            (written by scripts/sync-images.mjs)
// Output: public/images/_opt/<dir>__<name>-<w>.{avif,webp}  and  src/data/images.json  (local src -> {w,h,widths,name,dir})
// SVGs are served as-is (no raster variants); their size comes from the manifest.
import sharp from 'sharp'
import { readdirSync, mkdirSync, readFileSync, writeFileSync, statSync, rmSync } from 'node:fs'
import path from 'node:path'

const ROOT = 'public/images'
const OUT = `${ROOT}/_opt`
const STEPS = [320, 480, 640, 800, 1024, 1280, 1600, 2000]
// --only <path> [...]: process just these images (paths under public/images) and merge them into images.json,
// keeping every other variant as it is. Without it, all images are rebuilt from scratch.
const only = process.argv.includes('--only') ? process.argv.slice(process.argv.indexOf('--only') + 1).map((p) => path.normalize(p)) : null
if (!only) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const walk = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return p === OUT ? [] : statSync(p).isDirectory() ? walk(p) : [p] })
const files = walk(ROOT).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).filter((f) => !only || only.includes(path.normalize(f)))
const meta = only ? JSON.parse(readFileSync('src/data/images.json', 'utf8')) : {}
let n = 0
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/')           // e.g. shared/linde.png
  const dir = path.dirname(rel)
  const base = path.parse(rel).name
  const name = `${dir.replace(/\//g, '-')}__${base}`
  try {
    const m = await sharp(f).metadata()
    const widths = STEPS.filter((w) => w < m.width)
    widths.push(m.width)
    const use = m.width <= 600 ? [m.width] : [...new Set(widths)]
    for (const w of use) for (const fmt of ['avif', 'webp']) {
      const out = path.join(OUT, `${name}-${w}.${fmt}`)
      const p = sharp(f).resize({ width: w, withoutEnlargement: true })
      await (fmt === 'avif' ? p.avif({ quality: 55, effort: 4 }) : p.webp({ quality: 80 })).toFile(out)
    }
    meta['/images/' + rel] = { w: m.width, h: m.height, widths: use, name, dir: '/images/_opt', alpha: !!m.hasAlpha }
    n++
  } catch (e) { console.log('skip', rel, e.message) }
}
writeFileSync('src/data/images.json', JSON.stringify(meta))
console.log('optimised', n, 'images; variants', readdirSync(OUT).length)
