import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/utils/cn'
import { CopyButton } from './CopyButton'
import { highlightCode, isLanguageReady, loadLanguage, resolveLanguage } from './highlight'

export interface CodeBlockProps {
  code: string
  /** Language id or alias — `json`, `js`, `ts`, `python`, `bash`, `curl`, … */
  language: string
  /** Overrides the auto-resolved toolbar label. */
  label?: string
  /** Optional context chip next to the language label (e.g. `request`). */
  title?: string
  showLineNumbers?: boolean
  /** Caps the body height and scrolls vertically instead of growing the page. */
  maxHeight?: number
  /** Hide the toolbar (language label + copy) when the host surface provides its own. */
  showToolbar?: boolean
  className?: string
  bodyClassName?: string
  copyLabel?: string
}

/**
 * The shared code surface for the whole frontend: documentation examples,
 * playground snippets, and JSON payloads all render through this component.
 * Styling comes from the `.code-surface` token theme in globals.css, tuned to
 * the Kyyinfinite navy console identity.
 */
export function CodeBlock({
  code,
  language,
  label,
  title,
  showLineNumbers = false,
  maxHeight,
  showToolbar = true,
  className,
  bodyClassName,
  copyLabel = 'Copy',
}: CodeBlockProps) {
  const resolved = useMemo(() => resolveLanguage(language), [language])
  const displayLabel = label ?? resolved.label
  const [grammarReady, setGrammarReady] = useState(() => isLanguageReady(resolved.id))

  useEffect(() => {
    if (isLanguageReady(resolved.id)) {
      // Grammar already available (e.g. JSON, or a language loaded earlier).
      setGrammarReady(true)
      return
    }
    // The language changed to a grammar that is not registered yet: render
    // escaped text first, then swap in highlighting once it finishes loading.
    setGrammarReady(false)
    let active = true
    loadLanguage(resolved.id).then(() => {
      if (active) setGrammarReady(true)
    })
    return () => {
      active = false
    }
  }, [resolved.id])

  const html = useMemo(
    () => (grammarReady ? highlightCode(code, language) : null),
    [grammarReady, code, language],
  )

  const lines = useMemo(() => code.split('\n'), [code])

  return (
    <div
      className={cn(
        'code-surface overflow-hidden rounded-xl border border-navy-border bg-navy',
        className,
      )}
    >
      {showToolbar && (
        <div className="flex min-h-[42px] items-center justify-between gap-3 border-b border-navy-border px-4 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-[#3a4660]" />
              <span className="h-2 w-2 rounded-full bg-[#3a4660]" />
              <span className="h-2 w-2 rounded-full bg-[#3a4660]" />
            </span>
            <span className="truncate font-mono text-[11px] font-semibold uppercase tracking-wideCaps text-[#8b93ab]">
              {displayLabel}
            </span>
            {title && (
              <>
                <span className="text-[#3a4660]" aria-hidden="true">
                  ·
                </span>
                <span className="truncate font-mono text-[11px] text-[#6c7390]">{title}</span>
              </>
            )}
          </div>
          <CopyButton value={code} onDark label={copyLabel} srLabel={`Copy ${displayLabel} code`} />
        </div>
      )}

      <div
        className={cn('code-scroll flex min-w-0', maxHeight !== undefined && 'overflow-y-auto')}
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
        {showLineNumbers && (
          <div
            aria-hidden="true"
            className="shrink-0 select-none border-r border-navy-border bg-[#141b2c] px-3 py-4 text-right font-mono text-[12.5px] leading-[1.75] text-[#4a5168]"
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <pre
          className={cn(
            'code-scroll min-w-0 flex-1 overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] text-[#c8cfe4]',
            bodyClassName,
          )}
        >
          <code
            className={`language-${resolved.id}`}
            dangerouslySetInnerHTML={
              html !== null
                ? { __html: html }
                : { __html: code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
            }
          />
        </pre>
      </div>
    </div>
  )
}
