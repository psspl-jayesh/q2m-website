// Live-page content extractor. Pure function: HTML in, ordered structured content out. No rewriting of text.
import * as cheerio from 'cheerio'

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim()
/** Visible text of an element: <br> and block children become spaces so words never run together. */
const textOf = ($, el) => { const c = $(el).clone(); c.find('br').replaceWith(' '); c.find('p,div,li,h1,h2,h3,h4,h5,h6,ul,ol').each((_, e) => { $(e).prepend(' ').append(' ') }); return clean(c.text()) }
const HEAD = /^h[1-6]$/
const BTN = /btn|button/i
const isSpacedDeco = (t) => { const tok = t.split(' '); return tok.length >= 7 && tok.every((x) => x.length <= 1) } // "S T R A T E G Y . D E S I G N ." decorative strap

export function extractPage(html) {
  const $ = cheerio.load(html)
  const seo = { title: clean($('title').first().text()), description: clean($('meta[name="description"]').attr('content')), h1: clean($('h1').first().text()), h1Count: $('h1').length, canonical: $('link[rel=canonical]').attr('href') || '' }

  // FAQs first (accordion items, including collapsed bodies), then remove them so the walk does not repeat them
  const faqs = []
  $('.accordion-item').each((_, el) => {
    const q = clean($(el).find('.accordion-button').first().text()).replace(/^\d+\.\s*/, '')
    const a = $(el).find('.accordion-body').first().clone()
    a.find('br').replaceWith('\n'); a.find('p,li,div').each((__, e) => { $(e).append('\n\n') })
    const paras = a.text().split(/\n\s*\n/).map(clean).filter(Boolean)
    if (q && paras.length) faqs.push({ q, a: paras })
  })
  $('.accordion').remove()

  $('script,style,noscript,template,svg,iframe,link,meta,form,.comment-respond').remove()
  // site chrome and duplicates: header/footer/menus/off-canvas, cloned slides, mobile-only copies
  $('header, footer, nav, .elementor-location-header, .elementor-location-footer, .offcanvas, [class*="mobile-menu"], [class*="search-popup"], [class*="sidebar-"], .slick-cloned, .swiper-slide-duplicate, .elementor-hidden-desktop, .elementor-hidden-tablet').remove()

  const out = []
  const skipped = { deco: [], noise: [] }
  const push = (b) => { if (b.text !== undefined && !b.text) return; out.push(b) }

  const walk = (node) => {
    $(node).contents().each((_, n) => {
      if (n.type !== 'tag') return
      const el = n, $el = $(el), tag = el.tagName, cls = el.attribs?.class || ''
      if (HEAD.test(tag)) { // counters rendered as headings are handled by the parent <li>
        if (/(^|\s)counter(\s|$)/.test(cls)) return
        const parts = ($el.html() || '').split(/<br\s*\/?>/i)
        if (parts.length > 1) { // "<h2>Title<br><span style=font-size:18px>long paragraph</span></h2>": heading + paragraph
          const head = clean(cheerio.load('<div>' + parts[0] + '</div>')('div').text()); const rest = clean(cheerio.load('<div>' + parts.slice(1).join(' ') + '</div>')('div').text())
          if (rest.length > 80) { push({ t: tag, text: head }); push({ t: 'p', text: rest, via: 'heading-span' }); return }
        }
        push({ t: tag, text: textOf($, el) }); return
      }
      if ($el.hasClass('elementor-counter')) {
        const num = $el.find('[data-to-value]').first()
        push({ t: 'stat', value: num.attr('data-to-value') ?? null, prefix: clean($el.find('.elementor-counter-number-prefix').text()), suffix: clean($el.find('.elementor-counter-number-suffix').text()), text: clean($el.find('.elementor-counter-title').text()) }); return
      }
      if ($el.hasClass('elementor-testimonial-wrapper') || $el.find('.elementor-testimonial-content').length && !$el.parents('.elementor-testimonial-wrapper').length && tag === 'div' && $el.hasClass('elementor-testimonial-wrapper')) {
        push({ t: 'quote', text: clean($el.find('.elementor-testimonial-content').text()), name: clean($el.find('.elementor-testimonial-name').text()), role: clean($el.find('.elementor-testimonial-job').text()) }); return
      }
      if (tag === 'li') {
        const counter = $el.find('.counter').first()
        if (counter.length) { // "<h5 class=counter>50</h5> Project We Have Completed"
          const value = clean(counter.text()); const c2 = $el.clone(); c2.find('.counter').remove()
          push({ t: 'stat', value, prefix: '', suffix: '', text: clean(c2.text()), raw: clean($el.text()) }); return
        }
        const c = $el.clone(); c.find('ul,ol').remove(); c.find('br').replaceWith(' '); push({ t: 'li', text: clean(c.text()) }); $el.children('ul,ol').each((__, l) => walk(l)); return
      }
      if (tag === 'p' || tag === 'blockquote') { push({ t: 'p', text: textOf($, el) }); return }
      if (tag === 'a' && BTN.test(cls)) { const text = clean($el.text()); if (text) push({ t: 'btn', text, href: $el.attr('href') || '' }); return }
      if (tag === 'span' && /sub-title/.test(cls)) { push({ t: 'eyebrow', text: clean($el.text()) }); return }
      if (tag === 'img' || tag === 'picture' || tag === 'figure' && !$el.find('figcaption').length) return
      // leaf block: has direct text and no child element that itself carries text blocks
      const kids = $el.children().filter((__, k) => !/^(br|img|picture|svg|i|em|strong|b|span|a|small|sup|sub|u|mark)$/i.test(k.tagName) || false)
      const direct = clean($el.contents().filter((__, k) => k.type === 'text').text())
      const blockKid = $el.find('h1,h2,h3,h4,h5,h6,p,li,blockquote,.elementor-counter,.elementor-testimonial-wrapper').length
      if (!blockKid && (tag === 'div' || tag === 'span' || tag === 'dd' || tag === 'dt' || tag === 'td' || tag === 'th' || tag === 'figcaption' || tag === 'a' || tag === 'label') && clean($el.text())) {
        const t = textOf($, el)
        if (isSpacedDeco(t)) { skipped.deco.push(t); return }
        if ((tag === 'div' || tag === 'span') && /button|btn/i.test(cls)) { const href = $el.closest('a').attr('href') || $el.find('a').first().attr('href') || ''; if (href) push({ t: 'btn', text: t, href }); else skipped.noise.push(t + ' (button-like element without a link)'); return }
        if (tag === 'a' && !BTN.test(cls)) { /* plain link inside a card: keep the visible text */ }
        push({ t: 'p', text: t, via: tag }); return
      }
      void kids; void direct
      walk(el)
    })
  }
  walk($('body'))

  // eyebrow text belongs to the heading that follows it
  const blocks = []
  for (let i = 0; i < out.length; i++) {
    const b = out[i], n = out[i + 1]
    if (b.t === 'p' && (b.via === 'span' || b.via === 'div') && n && /^h[12]$/.test(n.t) && b.text.length < 60 && !/^(book|free|get|contact|read|view|learn|register|start|talk)/i.test(b.text)) { blocks.push({ ...n, eyebrow: b.text }); i++; continue }
    if (b.t === 'eyebrow') { if (n && HEAD.test(n.t)) { blocks.push({ ...n, eyebrow: b.text }); i++ } else blocks.push({ t: 'p', text: b.text, via: 'eyebrow' }); continue }
    blocks.push(b)
  }
  // remove repeated desktop/mobile copies: same type+text within the same heading section
  const seen = new Set(); const dedup = []; let sec = 0
  for (const b of blocks) {
    if (b.t === 'h1' || b.t === 'h2') { sec++ }
    const k = `${sec}|${b.t}|${b.text}|${b.href ?? ''}|${b.value ?? ''}`
    if (b.t !== 'li' && seen.has(k)) continue
    if (b.t === 'li' && dedup.length && dedup[dedup.length - 1].t === 'li' && dedup[dedup.length - 1].text === b.text) continue
    seen.add(k); dedup.push(b)
  }
  // classify page furniture so it is kept in the data but never rendered as body copy
  const firstH1 = dedup.findIndex((b) => b.t === 'h1')
  dedup.forEach((b, i) => { if (b.t === 'li' && firstH1 > -1 && i < firstH1) b.t = 'breadcrumb' })
  const firstPara = dedup.findIndex((b, i) => i > firstH1 && b.t === 'p' && b.text.length > 60)
  const isPost = dedup.some((b) => b.t === 'h6' && /^By,/i.test(b.text))
  if (isPost) { dedup.forEach((b, i) => { if (i > firstH1 && i < firstPara && b.t !== 'h1') { b.meta = b.t; b.t = 'meta' } }) }
  const prv = dedup.findIndex((b) => b.t === 'p' && /^PRV PROJECT$/i.test(b.text))
  if (prv > -1) dedup.forEach((b, i) => { if (i >= prv) { b.t = 'nav'; } })
  return { seo, blocks: dedup, faqs, skipped }
}
