import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps {
  /** Explicit width; omit to fill the parent. */
  width?: number | string
  /** Explicit height; omit to rely on the usage-site class. */
  height?: number | string
  /** Renders a fully rounded block (avatars, dots, pills). */
  circle?: boolean
  /** Use the navy console palette instead of the paper palette. */
  dark?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Base shimmer block. Decorative by design: individual blocks are
 * aria-hidden and the containing region announces the loading state once
 * (see SkeletonRegion).
 */
export function Skeleton({ width, height, circle, dark, className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton', dark && 'skeleton-dark', circle && 'rounded-full', className)}
      style={{ width, height, ...style }}
    />
  )
}
