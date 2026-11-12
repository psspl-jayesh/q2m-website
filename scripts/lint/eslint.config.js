// ESLint for the Q2M site (run from the repo root: npm run lint).
// Kept in scripts/lint with its own install: the site builds with TypeScript 7 (native, no JS API yet) and ESLint's
// TypeScript parser needs TypeScript 5.x, which is installed here only for linting.
// eslint-plugin-react-refresh is not used: it only concerns how finely Vite hot-reloads files during development, not the
// shipped site, and several modules intentionally export a provider or route tree together with helpers.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default tseslint.config(
  { basePath: '../..' },
  { ignores: ['dist/**', 'dist-ssr/**', 'node_modules/**', 'scripts/*/node_modules/**', 'scripts/qa/results/**', 'docs/**', 'public/**'] },
  // Site code (React + TypeScript)
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-console': 'error',
      'no-debugger': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // Vite config (TypeScript, runs in Node)
  { files: ['vite.config.ts'], extends: [js.configs.recommended, ...tseslint.configs.recommended], languageOptions: { globals: globals.node } },
  // Build and content scripts (Node)
  {
    files: ['scripts/**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.node } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }] },
  },
  // QA scripts run code inside the browser page (page.evaluate), so they use browser globals too
  { files: ['scripts/qa/**/*.mjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
)
