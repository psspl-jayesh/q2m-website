// Converts American spellings to Indian English (British spelling) in the synced content. Idempotent.
// Run after `npm run content`:  node scripts/localise-content.mjs
// Scope: spelling only. Product names are protected. Region facts (client locations, event venues) are NOT changed: see docs/INDIA_LOCALISATION.md.
import { readFileSync, writeFileSync } from 'node:fs'
import { fix, stats } from './lib-spelling.mjs'

const FILES = ['src/data/content.json', 'src/data/home.json']

const walk = (o) => {
  if (typeof o === 'string') return fix(o)
  if (Array.isArray(o)) return o.map(walk)
  if (o && typeof o === 'object') { const r = {}; for (const [k, v] of Object.entries(o)) r[k] = /^(path|slug|src|href|url|link|date|modified|type|t|id|ogImage|syncedAt|source|ingestedAt|robots)$/.test(k) ? v : walk(v); return r }
  return o
}

for (const f of FILES) {
  const data = JSON.parse(readFileSync(f, 'utf8'))
  const before = stats.total
  const out = walk(data)
  if (f.endsWith('content.json')) out.hygiene = { ...(out.hygiene ?? {}), localisation: { spelling: 'American to Indian (British) English', replacements: stats.total - before } }
  writeFileSync(f, JSON.stringify(out, f.endsWith('home.json') ? null : undefined, f.endsWith('home.json') ? 1 : undefined))
  console.log(f, 'replacements:', stats.total - before)
}
console.log('top changes:', Object.entries(stats.words).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k} x${v}`).join('\n  '))
