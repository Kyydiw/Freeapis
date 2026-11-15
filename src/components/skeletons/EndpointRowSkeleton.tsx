import { Skeleton } from './Skeleton'
import { cn } from '@/utils/cn'

/**
 * Mirrors EndpointRow (explorer list view): method badge, path, title,
 * summary, and the trailing action arrow — with the same responsive
 * visibility breakpoints as the real row.
 */
export function EndpointRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex items-center gap-3 border-b border-line-muted px-4 py-3 last:border-0',
        className,
      )}
    >
      <Skeleton className="h-[22px] w-[52px] rounded-md" />
      <Skeleton className="hidden h-4 flex-1 sm:block" />
      <Skeleton className="h-4 flex-1 sm:basis-[38%] sm:flex-none" />
      <Skeleton className="hidden h-3.5 flex-1 lg:block" />
      <Skeleton circle width={14} height={14} className="shrink-0" />
    </div>
  )
}
