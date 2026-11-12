// LCP element and request chain for one page (Lighthouse mobile). Usage: node lcp-debug.mjs /path/
import lighthouse from 'lighthouse'
import puppeteer from 'puppeteer-core'
import { BASE, CHROME } from './config.mjs'
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
const r = await lighthouse(BASE + process.argv[2], { port: new URL(b.wsEndpoint()).port, output: 'json', logLevel: 'error', formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }, throttlingMethod: 'simulate', onlyCategories: ['performance'] })
const a = r.lhr.audits
const el = a['largest-contentful-paint-element']?.details?.items?.flatMap((i) => i.items ?? [i]) ?? []
console.log(JSON.stringify(el.map((x) => x.node ? { selector: x.node.selector, snippet: x.node.snippet?.slice(0, 220) } : x), null, 1).slice(0, 1500))
const lcpReq = a['lcp-discovery-insight'] || a['prioritize-lcp-image']
console.log('discovery:', JSON.stringify(lcpReq?.details ?? null).slice(0, 900))
const bd = a['lcp-breakdown-insight']?.details?.items?.find((i) => i.type === 'table')
console.log('breakdown:', JSON.stringify(bd?.items?.map((x) => [x.subpart, Math.round(x.duration)])))
const m = a.metrics.details.items[0]
console.log('LCP', a['largest-contentful-paint'].displayValue, 'FCP', a['first-contentful-paint'].displayValue, 'observed LCP', m.observedLargestContentfulPaint, 'observed FCP', m.observedFirstContentfulPaint, 'observed load', m.observedLoad)
const reqs = a['network-requests'].details.items.filter((x) => /\.(js|avif|webp|css)$/.test(x.url)).map((x) => [x.url.split('/').pop().slice(0, 50), Math.round(x.transferSize / 1024) + 'KB', x.priority, Math.round(x.networkRequestTime), Math.round(x.networkEndTime)])
console.log(JSON.stringify(reqs.slice(0, 14)))
await b.close()
