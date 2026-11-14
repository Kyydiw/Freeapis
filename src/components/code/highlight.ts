import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

/**
 * Shared syntax highlighting for the Kyyinfinite frontend.
 *
 * JSON is registered eagerly because the homepage console renders JSON
 * immediately. The remaining grammars are larger and only needed on the
 * documentation, playground, and endpoint pages, so they are fetched on
 * first use and cached.
 */

hljs.registerLanguage('json', json)

export type CodeLanguageId = 'json' | 'javascript' | 'typescript' | 'python' | 'bash'

const STATIC_LANGUAGES: readonly CodeLanguageId[] = ['json']

const LANGUAGE_ALIASES: Record<string, { id: CodeLanguageId; label: string }> = {
  json: { id: 'json', label: 'JSON' },
  javascript: { id: 'javascript', label: 'JavaScript' },
  js: { id: 'javascript', label: 'JavaScript' },
  jsx: { id: 'javascript', label: 'JSX' },
  typescript: { id: 'typescript', label: 'TypeScript' },
  ts: { id: 'typescript', label: 'TypeScript' },
  tsx: { id: 'typescript', label: 'TSX' },
  python: { id: 'python', label: 'Python' },
  py: { id: 'python', label: 'Python' },
  bash: { id: 'bash', label: 'Bash' },
  sh: { id: 'bash', label: 'Shell' },
  shell: { id: 'bash', label: 'Shell' },
  zsh: { id: 'bash', label: 'Shell' },
  console: { id: 'bash', label: 'Terminal' },
  curl: { id: 'bash', label: 'cURL' },
}

export interface ResolvedLanguage {
  id: CodeLanguageId
  label: string
}

/** Map any incoming language string (including aliases such as `curl`) to a grammar id + display label. */
export function resolveLanguage(input: string): ResolvedLanguage {
  const key = input.trim().toLowerCase()
  const alias = LANGUAGE_ALIASES[key]
  if (alias) return alias
  return { id: 'json', label: key ? key.toUpperCase() : 'TEXT' }
}

const loadedLanguages = new Set<string>(STATIC_LANGUAGES)
const pendingLoads = new Map<CodeLanguageId, Promise<void>>()

async function registerLanguage(id: CodeLanguageId): Promise<void> {
  // TypeScript builds on the JavaScript grammar, so load both together.
  if (id === 'typescript' && !loadedLanguages.has('javascript')) {
    await registerLanguage('javascript')
  }
  switch (id) {
    case 'javascript': {
      const mod = await import('highlight.js/lib/languages/javascript')
      if (!loadedLanguages.has('javascript')) {
        hljs.registerLanguage('javascript', mod.default)
        loadedLanguages.add('javascript')
      }
      break
    }
    case 'typescript': {
      const mod = await import('highlight.js/lib/languages/typescript')
      if (!loadedLanguages.has('typescript')) {
        hljs.registerLanguage('typescript', mod.default)
        loadedLanguages.add('typescript')
      }
      break
    }
    case 'python': {
      const mod = await import('highlight.js/lib/languages/python')
      if (!loadedLanguages.has('python')) {
        hljs.registerLanguage('python', mod.default)
        loadedLanguages.add('python')
      }
      break
    }
    case 'bash': {
      const mod = await import('highlight.js/lib/languages/bash')
      if (!loadedLanguages.has('bash')) {
        hljs.registerLanguage('bash', mod.default)
        loadedLanguages.add('bash')
      }
      break
    }
    case 'json':
      break
  }
}

/** Load a grammar on demand. Resolved promises are cached, concurrent calls share one load. */
export function loadLanguage(id: CodeLanguageId): Promise<void> {
  if (loadedLanguages.has(id)) return Promise.resolve()
  const pending = pendingLoads.get(id)
  if (pending) return pending
  const promise = registerLanguage(id).finally(() => pendingLoads.delete(id))
  pendingLoads.set(id, promise)
  return promise
}

export function isLanguageReady(id: CodeLanguageId): boolean {
  return loadedLanguages.has(id)
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Highlight `code` for a language. Falls back to escaped plain text when the
 * grammar has not been registered (yet), so rendering never throws.
 */
export function highlightCode(code: string, language: string): string {
  const { id } = resolveLanguage(language)
  if (!hljs.getLanguage(id)) return escapeHtml(code)
  try {
    return hljs.highlight(code, { language: id, ignoreIllegals: true }).value
  } catch {
    return escapeHtml(code)
  }
}
