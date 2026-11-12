// HTML validation of every built page (html-validate, "standard" preset: spec conformance such as duplicate IDs,
// interactive elements nested in interactive elements, invalid nesting, missing required attributes) + one <h1> per page.
import { HtmlValidate } from 'html-validate'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { ROOT } from './config.mjs'

const DIST = ROOT + 'dist'
const files = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = `${d}/${f}`; if (statSync(p).isDirectory()) { if (f !== 'assets' && f !== 'images') walk(p) } else if (f.endsWith('.html')) files.push(p) } }
walk(DIST)
const hv = new HtmlValidate({ extends: ['html-validate:standard'] })
const byRule = {}
let pages = 0, bad = 0
for (const f of files) {
  const html = readFileSync(f, 'utf8')
  const report = await hv.validateString(html, f)
  const h1 = (html.match(/<h1[\s>]/g) || []).length
  const msgs = report.results.flatMap((r) => r.messages)
  if (h1 !== 1) msgs.push({ ruleId: 'one-h1', message: `${h1} <h1> elements`, line: 0 })
  pages++
  if (msgs.length) bad++
  for (const m of msgs) (byRule[m.ruleId] ??= []).push(`${f.slice(DIST.length)}:${m.line} ${m.message.slice(0, 140)}`)
}
console.log(JSON.stringify({ pages, pagesWithIssues: bad, byRule: Object.fromEntries(Object.entries(byRule).map(([k, v]) => [k, { count: v.length, examples: [...new Set(v)].slice(0, 4) }])) }, null, 1))
process.exit(bad ? 1 : 0)
