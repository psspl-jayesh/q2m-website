import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Preload the two brand fonts used above the fold (DM Sans body, Sora headings, Latin subset) so they are ready at first paint.
 * Without this, text first renders in the fallback font and re-wraps when the brand font arrives, which shifts the layout.
 */
function preloadFonts(): Plugin {
  const FONTS = [
    { pkg: 'dm-sans', file: 'dm-sans-latin-wght-normal' },
    { pkg: 'sora', file: 'sora-latin-wght-normal' },
  ]
  return {
    name: 'q2m-preload-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const hrefs = ctx.bundle
          ? Object.keys(ctx.bundle).filter((f) => f.endsWith('.woff2') && FONTS.some((x) => f.includes(x.file))).map((f) => `/${f}`)
          : FONTS.map((x) => `/node_modules/@fontsource-variable/${x.pkg}/files/${x.file}.woff2`)
        return hrefs.map((href) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: '' }, injectTo: 'head' as const }))
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFonts()],
  resolve: { alias: { '@': '/src' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react'
          if (/node_modules\/motion/.test(id)) return 'motion'
        },
      },
    },
  },
})
