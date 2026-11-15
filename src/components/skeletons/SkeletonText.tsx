import { Skeleton } from './Skeleton'
import { cn } from '@/utils/cn'

export interface SkeletonTextProps {
  /** Number of lines to render. */
  lines?: number
  /** Width of the last line, e.g. "60%". */
  lastWidth?: string
  className?: string
  lineClassName?: string
  dark?: boolean
}

/** Multi-line text placeholder with a naturally shorter final line. */
export function SkeletonText({
  lines = 3,
  lastWidth = '60%',
  className,
  lineClassName,
  dark,
}: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          dark={dark}
          className={cn('h-3', lineClassName)}
          style={index === lines - 1 ? { width: lastWidth } : undefined}
        />
      ))}
    </div>
  )
}
