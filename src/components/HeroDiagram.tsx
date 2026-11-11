import { motion, useReducedMotion } from 'motion/react'
import DotArrow from './DotArrow'

/** Q2M delivery architecture: data, intelligence, applications. Labels come from the Q2M stack listed on the live site. */
const COLS = [
  { title: 'Data', items: ['Azure Data Factory', 'Azure Synapse Analytics', 'Azure Databricks', 'Microsoft Fabric'] },
  { title: 'Intelligence', items: ['Azure OpenAI Service', 'Azure AI Search and RAG', 'Azure Machine Learning', 'Document Intelligence'] },
  { title: 'Applications', items: ['AI Agents', 'Copilot Studio', 'Microsoft 365 Copilot', 'Power Platform'] },
]

export default function HeroDiagram() {
  const reduce = useReducedMotion()
  return (
    <figure className="on-dark rounded-lg bg-block p-4 text-ink-inverse sm:p-8" aria-label="Q2M delivery stack: from data, through intelligence, to applications">
      <DotArrow pitch={12} className="mb-6 ml-auto block h-auto w-[84px]" />
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {COLS.map((c, ci) => (
          <div key={c.title}>
            <p className="eyebrow mb-4 flex items-center gap-2"><span className="mono text-block-muted">0{ci + 1}</span>{c.title}</p>
            <ul className="space-y-2">
              {c.items.map((it, i) => (
                <motion.li key={it} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + ci * 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-sm border border-block-line px-2 py-2 text-[0.75rem] leading-snug sm:px-3 sm:text-sm">{it}</motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <svg aria-hidden className="mt-6 block h-4 w-full" viewBox="0 0 600 16" preserveAspectRatio="none">
        <line x1="0" y1="8" x2="600" y2="8" stroke="#2a2e35" strokeWidth="2" />
        {!reduce && [0, 1, 2].map((i) => (
          <motion.circle key={i} r="4" cy="8" fill="#0075ea" initial={{ cx: 0, opacity: 0 }} animate={{ cx: 600, opacity: [0, 1, 1, 0] }} transition={{ duration: 4.2, repeat: Infinity, delay: i * 1.4, ease: 'linear' }} />
        ))}
      </svg>
      <figcaption className="mono mt-3 flex items-center justify-between text-block-muted">
        <span>Azure AI stack</span><span>Pilot to production</span>
      </figcaption>
    </figure>
  )
}
