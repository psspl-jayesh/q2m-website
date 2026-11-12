// Every LCP entry the browser reports (time, size, element) on a phone-sized viewport. Usage: node lcp-entries.mjs /path/
import puppeteer from 'puppeteer-core'
import { BASE, CHROME } from './config.mjs'
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage(); await p.setViewport({ width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true })
const cdp = await p.createCDPSession(); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
await p.evaluateOnNewDocument(() => { window.__lcp = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), size: e.size, el: e.element ? e.element.tagName + '.' + String(e.element.className).slice(0, 40) : null, parentStyle: e.element?.parentElement?.getAttribute('style')?.slice(0, 80) }) }).observe({ type: 'largest-contentful-paint', buffered: true }) })
await p.goto(BASE + process.argv[2], { waitUntil: 'networkidle0' }); await new Promise((r) => setTimeout(r, 3500))
console.log(JSON.stringify(await p.evaluate(() => window.__lcp), null, 1))
const hero = await p.evaluate(() => { const i = document.querySelector('main img'); let n = i; const chain = []; for (let k = 0; k < 4 && n; k++) { chain.push(n.tagName + ' style=' + (n.getAttribute('style') || '').slice(0, 90)); n = n.parentElement } return chain })
console.log(hero.join('\n'))
await b.close()
