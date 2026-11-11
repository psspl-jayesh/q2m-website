// Shared spelling converter: American -> Indian (British) English. Used by localise-content.mjs and sync-images.mjs.
// Product / brand names that must keep their official spelling.
const PROTECT = ['Personalizer', 'Recognizer', 'Optimizely', 'Form Recognizer', 'Custom Vision', 'Unity Catalog', 'Data Catalog', 'Admin Center', 'Contact Center', 'Microsoft Purview', 'Azure Cost Management']

// stems whose -ize/-ization/-izing forms become -ise/-isation/-ising
const IZE = ['optim', 'organ', 'modern', 'custom', 'personal', 'util', 'standard', 'minim', 'maxim', 'priorit', 'categor', 'visual', 'summar', 'recogn', 'synchron', 'central', 'digit', 'monet', 'operational', 'special', 'general', 'final', 'normal', 'local', 'mobil', 'harmon', 'capital', 'emphas', 'memor', 'author', 'real', 'penal', 'stabil', 'virtual', 'container', 'commercial', 'industrial', 'revolution', 'democrat', 'sanit', 'fertil', 'crystal', 'colon', 'tokeniz'.replace('iz', ''), 'vectoriz'.replace('iz', ''), 'hospital', 'itemiz'.replace('iz', ''), 'formal', 'randomiz'.replace('iz', ''), 'prioritiz'.replace('iz', ''), 'contextual', 'fin', 'bureaucrat', 'characteriz'.replace('iz', ''), 'conceptual', 'ration', 'internation', 'national', 'societ', 'subsid', 'utiliz'.replace('iz', ''), 'empath', 'sympath', 'apolog', 'criticiz'.replace('iz', ''), 'jeopard', 'legitim', 'mechan', 'neutral', 'plural', 'pasteur', 'scrutin', 'theor', 'vandal', 'womanizer'.replace('izer', '')]
const izeRe = new RegExp(`\\b(${[...new Set(IZE)].filter(Boolean).join('|')})iz(e|es|ed|ing|ation|ations|er|ers|able)\\b`, 'gi')

const RULES = [
  [/\banalyz(e|es|ed|ing|er|ers)\b/gi, (m, e) => 'analys' + e],
  [/\b(behavio)r(s|al|ally)?\b/gi, (m, a, e) => a + 'ur' + (e ?? '')],
  [/\b(colo)r(s|ed|ful|ing)?\b/gi, (m, a, e) => a + 'ur' + (e ?? '')],
  [/\b(favo)r(s|ed|ite|ites|able)?\b/gi, (m, a, e) => a + 'ur' + (e ?? '')],
  [/\b(labo)r(s|ed|ing)?\b/gi, (m, a, e) => a + 'ur' + (e ?? '')],
  [/\b(neighbo)r(s|hood|hoods)?\b/gi, (m, a, e) => a + 'ur' + (e ?? '')],
  [/\bdefense(s)?\b/gi, (m, s) => 'defence' + (s ?? '')],
  [/\boffense(s)?\b/gi, (m, s) => 'offence' + (s ?? '')],
  [/\bcenter(s|ed|ing)?\b/g, (m, e) => (e === 'ed' ? 'centred' : e === 'ing' ? 'centring' : 'centre' + (e ?? ''))], // lower-case only: capitalised product names stay
  [/\bfulfill(ment|ments)?\b/gi, (m, e) => 'fulfil' + (e ?? '')],
  [/\b(model|label|travel|cancel|signal|channel|level)(ing|ed|er|ers)\b/gi, (m, a, e) => (/^(model|label|travel|cancel|signal|channel)$/i.test(a) ? a + 'l' + e : m)],
  [/\bgray\b/gi, () => 'grey'],
  [/\bjudgment(s)?\b/gi, (m, s) => 'judgement' + (s ?? '')],
  [/\bsceptic/gi, (m) => m],
]

const keepCase = (orig, out) => (orig === orig.toUpperCase() && orig.length > 1 ? out.toUpperCase() : orig[0] === orig[0].toUpperCase() ? out[0].toUpperCase() + out.slice(1) : out)

const stats = { total: 0, words: {} }
function fix(text) {
  if (typeof text !== 'string' || !text) return text
  const held = []
  let t = text
  PROTECT.forEach((p, i) => { t = t.split(p).join(`\u0000${i}\u0000`) })
  t = t.replace(izeRe, (m, stem, end) => { const out = keepCase(m, `${stem}is${end}`); count(m, out); return out })
  for (const [re, fn] of RULES) t = t.replace(re, (...a) => { const out = fn(...a); const o = typeof out === 'string' ? keepCase(a[0], out.toLowerCase()) : a[0]; if (o !== a[0]) count(a[0], o); return o })
  PROTECT.forEach((p, i) => { t = t.split(`\u0000${i}\u0000`).join(p) })
  void held
  return t
}
function count(a, b) { stats.total++; const k = `${a.toLowerCase()} -> ${b.toLowerCase()}`; stats.words[k] = (stats.words[k] || 0) + 1 }


export { fix, stats }
