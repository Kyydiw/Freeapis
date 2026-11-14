import { Check, Copy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    // Clipboard API can be unavailable (insecure context, permission denied).
    // Fall back to the legacy path so copy always works.
    try {
      const ta = document.createElement('textarea')
      ta.value = value
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

export interface CopyButtonProps {
  value: string
  label?: string
  className?: string
  onDark?: boolean
  /** Accessible description announced to screen readers, e.g. "Copy response body". */
  srLabel?: string
}

export function CopyButton({ value, label = 'Copy', className, onDark = false, srLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(async () => {
    const ok = await copyToClipboard(value)
    if (!ok) return
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }, [value])

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      aria-label={srLabel ?? label}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 font-body text-xs font-semibold transition-colors',
        onDark
          ? 'border-navy-border bg-navy text-[#a6acbf] hover:border-[#3a4660] hover:text-white'
          : 'border-line bg-paper-raised text-ink-soft hover:border-cobalt hover:text-cobalt',
        className,
      )}
    >
      {copied ? <Check size={14} className="text-success" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  )
}
