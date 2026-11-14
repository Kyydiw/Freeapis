import { cn } from '@/utils/cn'
import type { KeyValueRow } from '@/hooks/usePlaygroundRequest'

export interface KeyValueEditorProps {
  rows: KeyValueRow[]
  onChange: (rows: KeyValueRow[]) => void
  /** Noun used in labels, e.g. "parameter" or "header". */
  noun: string
  placeholderKey: string
  placeholderValue: string
  emptyHint?: string
}

/**
 * Key/value row editor used for query parameters and headers. Purely
 * controlled; labels are derived from `noun` for screen readers.
 */
export function KeyValueEditor({
  rows,
  onChange,
  noun,
  placeholderKey,
  placeholderValue,
  emptyHint,
}: KeyValueEditorProps) {
  const update = (i: number, patch: Partial<KeyValueRow>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && emptyHint && (
        <p className="rounded-lg border border-dashed border-line bg-paper px-3 py-2.5 font-mono text-[11px] text-ink-soft">
          {emptyHint}
        </p>
      )}
      {rows.map((row, i) => {
        const rowNumber = i + 1
        return (
          <div key={i} className="grid min-w-0 grid-cols-[1fr_1.4fr_40px] gap-2">
            <input
              value={row.key}
              onChange={(e) => update(i, { key: e.target.value })}
              placeholder={placeholderKey}
              className="h-10 min-w-0 rounded-lg border border-line bg-paper px-3 font-mono text-xs text-ink placeholder:text-ink-soft/70 focus:border-cobalt focus:outline-none"
              aria-label={`${noun} name ${rowNumber}`}
              spellCheck={false}
            />
            <input
              value={row.value}
              onChange={(e) => update(i, { value: e.target.value })}
              placeholder={placeholderValue}
              className="h-10 min-w-0 rounded-lg border border-line bg-paper px-3 font-mono text-xs text-ink placeholder:text-ink-soft/70 focus:border-cobalt focus:outline-none"
              aria-label={`${noun} value ${rowNumber}`}
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${noun} row ${rowNumber}`}
              className={cn(
                'h-10 w-10 shrink-0 rounded-lg border border-line bg-paper-raised text-base font-semibold leading-none text-ink-soft',
                'transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt',
              )}
            >
              ×
            </button>
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => onChange([...rows, { key: '', value: '' }])}
        className={cn(
          'self-start rounded-lg border border-dashed border-line px-3 py-1.5 font-body text-xs font-semibold text-ink-soft',
          'transition-colors hover:border-cobalt hover:text-cobalt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt',
        )}
      >
        + Add {noun}
      </button>
    </div>
  )
}
