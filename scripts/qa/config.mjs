// Shared settings for the QA scripts. Override with environment variables:
//   CHROME_PATH  path to Chrome/Chromium (default: the usual Windows install path)
//   BASE         site to test (default: the production preview, `npm run preview` on port 4173)
import { fileURLToPath } from 'node:url'
export const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
export const BASE = process.env.BASE || 'http://localhost:4173'
/** Repository root (two folders up from scripts/qa). */
export const ROOT = fileURLToPath(new URL('../../', import.meta.url))
