import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

export interface TabItem<T extends string> {
  id: T
  label: string
  /** Optional count chip, e.g. the number of active query parameters. */
  count?: number
}

export type TabsVariant = 'navy' | 'underline' | 'segmented'

export interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>
  value: T
  onChange: (id: T) => void
  /** Accessible name for the tab list, e.g. "Response views". */
  ariaLabel: string
  variant?: TabsVariant
  className?: string
}

const baseTab =
  'inline-flex items-center gap-1.5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt'

const variantStyles: Record<TabsVariant, { list: string; tab: string; active: string; idle: string }> = {
  navy: {
    list: 'gap-1',
    tab: 'rounded-t-lg border-b-2 px-3 py-2 font-body text-xs',
    active: 'border-b-[#4a5168] bg-[#172139] text-white',
    idle: 'border-b-transparent text-[#8b93ab] hover:text-white',
  },
  underline: {
    list: 'gap-1 border-b border-line-muted',
    tab: 'rounded-t-lg border-b-2 px-3.5 py-2.5 font-body text-[13px]',
    active: 'border-b-cobalt text-ink',
    idle: 'border-b-transparent text-ink-soft hover:text-ink',
  },
  segmented: {
    list: 'gap-0.5 rounded-[10px] border border-line bg-paper p-1',
    tab: 'rounded-lg px-3 py-1.5 font-body text-xs',
    active: 'bg-navy text-white',
    idle: 'text-ink-soft hover:text-ink',
  },
}

/**
 * Accessible tab bar used by the playground (request configuration, response
 * views, snippets) and endpoint pages. Implements the WAI-ARIA tabs pattern:
 * roving tabindex plus ArrowLeft/ArrowRight/Home/End keyboard navigation.
 * Panels are rendered by the caller and should use `role="tabpanel"` with
 * `aria-labelledby` when they contain landmark content.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  variant = 'underline',
  className,
}: TabsProps<T>) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = items.findIndex((item) => item.id === value)
    let next: number | null = null
    if (event.key === 'ArrowRight') next = (current + 1) % items.length
    else if (event.key === 'ArrowLeft') next = (current - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    if (next === null) return
    event.preventDefault()
    const target = items[next]
    if (!target) return
    onChange(target.id)
    tabRefs.current[next]?.focus()
  }

  const styles = variantStyles[variant]

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex items-center', styles.list, className)}
    >
      {items.map((item, i) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={handleKeyDown}
            className={cn(baseTab, styles.tab, active ? styles.active : styles.idle)}
          >
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-px font-mono text-[10px] leading-4',
                  variant === 'segmented'
                    ? active
                      ? 'bg-white/15 text-white'
                      : 'bg-line-muted text-ink-soft'
                    : active
                      ? 'bg-cobalt/15 text-cobalt'
                      : 'bg-line-muted text-ink-soft',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
