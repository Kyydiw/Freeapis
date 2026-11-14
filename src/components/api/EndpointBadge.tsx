import { cn } from '@/utils/cn'
import type { HttpMethod } from '@/services/api/api.types'

/**
 * Method badges use calm tints instead of solid fills so methods stay
 * distinguishable at a glance without loud color blocks. Each entry provides
 * a paper-surface and navy-console variant.
 */
const methodStyles: Record<HttpMethod, { light: string; dark: string }> = {
  GET: {
    light: 'border-cobalt/30 bg-cobalt/10 text-cobalt',
    dark: 'border-[#6fa8f5]/40 bg-[#6fa8f5]/15 text-[#9db8ff]',
  },
  POST: {
    light: 'border-[#20C76A]/35 bg-[#20C76A]/10 text-[#15854a]',
    dark: 'border-[#5ad592]/40 bg-[#5ad592]/15 text-[#7ee2a8]',
  },
  PUT: {
    light: 'border-signal/35 bg-signal/10 text-[#c4532f]',
    dark: 'border-[#f2a58b]/40 bg-[#f2a58b]/15 text-[#f2b56b]',
  },
  PATCH: {
    light: 'border-signal/35 bg-signal/10 text-[#c4532f]',
    dark: 'border-[#f2a58b]/40 bg-[#f2a58b]/15 text-[#f2b56b]',
  },
  DELETE: {
    light: 'border-ink/25 bg-ink/5 text-ink',
    dark: 'border-white/25 bg-white/10 text-white',
  },
}

export interface EndpointBadgeProps {
  method: HttpMethod
  onDark?: boolean
  className?: string
}

export function EndpointBadge({ method, onDark = false, className }: EndpointBadgeProps) {
  const style = methodStyles[method]
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center rounded-md border px-2.5 font-mono text-[11px] font-bold tracking-wide',
        onDark ? style.dark : style.light,
        className,
      )}
    >
      {method}
    </span>
  )
}
