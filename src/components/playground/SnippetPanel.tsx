import { useMemo, useState } from 'react'
import type { ApiRequestConfig } from '@/services/api/api.types'
import { buildCurl, buildFetch, buildPython } from '@/components/api/CodeExamples'
import { CodeBlock } from '@/components/code/CodeBlock'
import { CopyButton } from '@/components/code/CopyButton'
import { Tabs } from '@/components/ui/Tabs'

type SnippetLanguage = 'fetch' | 'curl' | 'python'

const snippetTabs = [
  { id: 'fetch' as const, label: 'JavaScript' },
  { id: 'curl' as const, label: 'cURL' },
  { id: 'python' as const, label: 'Python' },
]

export interface SnippetPanelProps {
  config: ApiRequestConfig
  baseUrl: string
  binaryMode: boolean
}

/**
 * Generated code panel. Snippets are rebuilt from the active request
 * configuration on every render, so they always match what the Send button
 * would actually transmit.
 */
export function SnippetPanel({ config, baseUrl, binaryMode }: SnippetPanelProps) {
  const [language, setLanguage] = useState<SnippetLanguage>('fetch')

  const code = useMemo(() => {
    const options = { binary: binaryMode }
    if (language === 'curl') return buildCurl(config, baseUrl, options)
    if (language === 'python') return buildPython(config, baseUrl, options)
    return buildFetch(config, baseUrl, options)
  }, [language, config, baseUrl, binaryMode])

  const codeLanguage = language === 'fetch' ? 'javascript' : language

  return (
    <section aria-label="Generated code" className="min-w-0 rounded-2xl border border-line bg-paper-raised">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-muted px-3 pt-2 sm:px-4">
        <Tabs
          variant="underline"
          ariaLabel="Snippet language"
          value={language}
          onChange={setLanguage}
          items={snippetTabs}
          className="flex-1"
        />
        <div className="pb-2 pr-1">
          <CopyButton value={code} srLabel={`Copy ${language} snippet`} />
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <CodeBlock
          code={code}
          language={codeLanguage}
          showToolbar={false}
          className="rounded-lg"
        />
        <p className="mt-2.5 font-mono text-[11px] leading-relaxed text-ink-soft">
          Synced with the active request — edits to params, headers, and body update the snippet instantly.
        </p>
      </div>
    </section>
  )
}
