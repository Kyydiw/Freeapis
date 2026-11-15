import type { ReactNode } from 'react'

export interface SkeletonRegionProps {
  children: ReactNode
  /** Announced once to assistive tech, e.g. "Loading endpoints". */
  label: string
  className?: string
}

/**
 * Accessibility wrapper for a group of skeletons. Announces the loading
 * state at the region level so every decorative block can stay silent.
 */
export function SkeletonRegion({ children, label, className }: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  )
}
