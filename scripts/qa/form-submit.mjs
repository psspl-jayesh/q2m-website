// Fill and submit a form with test data; report the status message shown and any console errors. Usage: node form-submit.mjs contact|booking [ok|fail]
// With ok|fail, calls to api.web3forms.com are answered locally (needs a build with VITE_WEB3FORMS_ACCESS_KEY set); nothing is sent.
import puppeteer from 'puppeteer-core'
import { BASE, CHROME } from './config.mjs'
const which = process.argv[2] || 'contact'
const mock = process.argv[3]
const posted = []
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
if (mock) {
  await p.setRequestInterception(true)
  p.on('request', (q) => {
    if (!q.url().startsWith('https://api.web3forms.com/')) return q.continue()
    if (q.method() === 'OPTIONS') return q.respond({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'POST' } })
    posted.push(JSON.parse(q.postData() || '{}'))
    q.respond({ status: mock === 'ok' ? 200 : 500, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ success: mock === 'ok' }) })
  })
}
await p.goto(BASE + (which === 'contact' ? '/contact/' : '/bengaluru-tech-summit-2026/'), { waitUntil: 'networkidle0' })
if (which === 'contact') {
  await p.type('#full-name', 'Test Person'); await p.type('#organization', 'Test Co'); await p.type('#email-company', 'test@example.com')
  await p.type('#tel-phone', '9876543210'); await p.type('#subject', 'Test subject'); await p.type('#textarea-message', 'This is a test message from QA.')
  await p.click('#c-consent')
  await p.evaluate(() => document.querySelector('form[aria-label="Contact form"] button[type="submit"]').click())
} else {
  await p.type('#b-name', 'Test Person'); await p.type('#b-company', 'Test Co'); await p.type('#b-email', 'test@example.com')
  await p.select('#b-time', await p.evaluate(() => document.querySelector('#b-time option:nth-child(2)')?.value || ''))
  await p.evaluate(() => { const c = [...document.querySelectorAll('input[type=checkbox]')].find((x) => x.closest('form[aria-label="Book a session"]')); c.click() })
  await p.evaluate(() => document.querySelector('form[aria-label="Book a session"] button[type="submit"]').click())
}
await new Promise((r) => setTimeout(r, 1500))
const r = await p.evaluate(() => ({ status: [...document.querySelectorAll('[role="status"]')].map((s) => s.innerText.trim()).filter(Boolean), invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map((e) => e.id), url: location.href, nameLeft: document.querySelector('#full-name, #b-name')?.value }))
console.log(JSON.stringify({ which, mock, ...r, posted: posted.map((x) => ({ ...x, access_key: x.access_key ? '(set)' : '(missing)' })), errs }, null, 1))
await b.close()
