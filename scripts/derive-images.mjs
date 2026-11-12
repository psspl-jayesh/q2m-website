// Derived images: crops of synced live-site images, for places where the original file is a composed graphic rather
// than a photo. Writes the crop next to the original (public/images/...); scripts/optimize-images.mjs then builds its
// variants like any other image. Runs in `npm run images` and `npm run sync` after sync-images.
import sharp from 'sharp'

const CROPS = [
  {
    // The live AI-agents banner is a square graphic: the photo sits in a rounded box with transparent margins and a blue
    // dot pattern painted over its top-right corner. Cards need the photo only: 16:10, AI agent centred, no dots, no margins.
    src: 'public/images/ai-agent-development-services/ai-agent-development-service-banner.webp',
    out: 'public/images/ai-agent-development-services/ai-agent-development-service-banner-photo.webp',
    box: { left: 47, top: 444, width: 1653, height: 1033 },
  },
]

for (const c of CROPS) {
  await sharp(c.src).extract(c.box).flatten({ background: '#000' }).webp({ quality: 90 }).toFile(c.out)
  console.log('derived', c.out, `${c.box.width}x${c.box.height}`)
}
