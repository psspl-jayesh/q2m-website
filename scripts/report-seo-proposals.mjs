// Writes docs/SEO_PROPOSALS.md: shortened title / description proposals for the live ones over the limits. NOT applied.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
const pages = Object.fromEntries(readdirSync('src/content/pages').map((f) => JSON.parse(readFileSync(`src/content/pages/${f}`, 'utf8'))).map((p) => [p.path, p]))
const T = {
  '/ai-agent-development-cost/': 'A Complete Breakdown of AI Agent Development Cost in 2026',
  '/ai-development-cost/': 'AI Development Cost in 2026: A Complete Pricing Guide',
  '/case-study/building-a-single-pane-of-glass-for-a-1500-truck-fleet/': 'Single Pane of Glass for a 1,500-Truck Fleet - Q2M Solutions',
  '/case-study/mindshift-an-ai-powered-personal-growth-wellbeing-app/': 'MindShift: An AI-Powered Wellbeing App - Q2M Solutions',
  '/case-study/rele-one-building-a-national-real-estate-platform-with-vibe-coding/': 'Rele.one: A National Real-Estate Platform - Q2M Solutions',
  '/cyber-security-services/': 'Cyber Security Services & Consulting Solutions',
  '/generative-ai-app-development-cost/': 'Generative AI App Development Cost in 2026: Full Guide',
  '/generative-ai-development-services/': 'Generative AI Development Services | GenAI Company',
  '/guide-microsoft-fabric-enables-real-time-analytics/': 'Guide: Microsoft Fabric Enables Real-time Analytics',
  '/hire-generative-ai-developers/': 'Hire Generative AI Developers: An In-Depth Guide',
  '/how-software-consulting-services-help-you-choose-the-right-project-model/': 'How Software Consulting Helps You Choose a Project Model',
  '/impact-of-digital-transformation-in-pharma/': 'The Impact of Digital Transformation in Pharma',
  '/machine-learning-models-on-azure/': 'Machine Learning Models on Azure | ML Solutions',
  '/microsoft-dynamics-365-and-dynamics-365-business-central/': 'Dynamics 365 vs Dynamics 365 Business Central Compared',
  '/predictive-analytics-services-2/': 'Predictive Analytics Services for Startups & Enterprises',
  '/q2m-solutions-is-heading-to-ai4-2026/': 'Q2M Solutions is Heading to Ai4 2026 in Las Vegas',
  '/sharepoint-framework-v1-22-1-a-stability-update-developers-shouldnt-skip/': 'SharePoint Framework v1.22.1: A Stability Update',
  '/the-transformative-power-of-ai-in-software-development/': 'Agile Reimagined: The Power of AI in Software Development',
}
const D = {
  '/ai-consulting-services/': 'Discover the AI development services by Q2M, and how businesses today can transform with artificial intelligence and other modern technologies.',
  '/ai-development-lifecycle/': 'Master the AI development lifecycle. Find out how engineering teams design, validate and deploy production-ready models from discovery to deployment.',
  '/ai-solutions-development/': 'Q2M empowers enterprises with AI solutions development that drives intelligent innovation, operational efficiency and sustainable growth.',
  '/azure-database-services/': 'Improve your data management with Q2M’s Microsoft Azure Database Services: secure, scalable and intelligent cloud solutions for your business.',
  '/azure-iot-solution/': 'Q2M Solutions delivers Azure IoT Solutions that connect devices, surface insights, boost efficiency and power your business in real time.',
  '/data-copilot-for-azure-ai/': 'Unlock smarter cloud management with Q2M Solutions’ Data Copilot for Azure AI: more efficiency, security and insight.',
  '/digital-sustainability-services/': 'Q2M delivers digital sustainability services that foster environmental responsibility, drive eco-friendly practices and power sustainable innovation.',
  '/hire-generative-ai-developers/': 'Hire generative AI developers to scale your enterprise AI. Read our expert guide on skills, costs and red flags.',
  '/how-software-consulting-services-help-you-choose-the-right-project-model/': 'Discover how software consulting services evaluate goals, budget, risks and timelines to help you choose the right project model.',
  '/modern-workplace/': 'Improve productivity and efficiency with our modern workplace consulting services that streamline operations and empower your team.',
}
const rows = (map, field, max) => Object.entries(map).map(([p, n]) => { const cur = field === 'title' ? pages[p].seo.title : pages[p].seo.description; if (n.length > max) throw new Error(`${p} proposal too long (${n.length})`); return `| ${p} | ${cur} (${cur.length}) | ${n} (${n.length}) |` })
const md = ['# SEO proposals (NOT applied)', '', 'Live titles and descriptions are kept as they are (`LOCALE.seoIndiaSuffix = false`). These shortened versions only keep wording from the live text. Approve all, some, or none.', '',
  `## Titles over 60 characters (${Object.keys(T).length}) → proposed ≤ 60`, '', '| Page | Live title (length) | Proposed (length) |', '|---|---|---|', ...rows(T, 'title', 60), '',
  `## Descriptions over 155 characters (${Object.keys(D).length}) → proposed ≤ 155`, '', '| Page | Live description (length) | Proposed (length) |', '|---|---|---|', ...rows(D, 'description', 155), '']
writeFileSync('docs/SEO_PROPOSALS.md', md.join('\n')); console.log('ok', Object.keys(T).length, Object.keys(D).length)
