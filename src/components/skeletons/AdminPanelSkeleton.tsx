import { Skeleton } from './Skeleton'
import { cn } from '@/utils/cn'

/** Mirrors the admin StatCard grid (overview tab). */
export function AdminStatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={cn('grid gap-4', count === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3')} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center gap-2.5">
            <Skeleton circle width={16} height={16} />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-1.5 h-2.5 w-32" />
        </div>
      ))}
    </div>
  )
}

/** Mirrors the 7-day requests bar chart panel. */
export function AdminChartSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5" aria-hidden="true">
      <Skeleton className="h-4 w-44" />
      <div className="mt-4 flex h-32 items-end gap-2">
        {[38, 62, 45, 80, 58, 70, 50].map((height, index) => (
          <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <Skeleton className="w-full rounded-t-md" style={{ height: `${height}%` }} />
            <Skeleton className="h-2 w-6" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Mirrors the admin data tables (overview per-endpoint traffic). */
export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5" aria-hidden="true">
      <Skeleton className="h-4 w-48" />
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-3.5 flex-1" style={{ maxWidth: `${70 + (index % 3) * 10}%` }} />
            <Skeleton className="hidden h-3.5 w-16 sm:block" />
            <Skeleton className="hidden h-3.5 w-12 sm:block" />
            <Skeleton className="h-3.5 w-14" />
          </div>
        ))}
      </div>
    </div>
  )
}

export type AdminRowVariant = 'endpoint' | 'category' | 'provider' | 'incident'

function RowSkeleton({ variant }: { variant: AdminRowVariant }) {
  if (variant === 'endpoint') {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-5" aria-hidden="true">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-6 w-[56px] rounded-md" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton circle width={16} height={16} className="ml-auto" />
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    )
  }

  if (variant === 'incident') {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-5" aria-hidden="true">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton circle width={16} height={16} />
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-3 w-44" />
          <Skeleton className="ml-auto h-9 w-24 rounded-[10px]" />
        </div>
        <Skeleton className="mt-3 h-3 w-[80%]" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-paper-raised p-5',
      )}
      aria-hidden="true"
    >
      {variant === 'provider' && <Skeleton circle width={18} height={18} />}
      <div className="flex min-w-0 flex-col gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
      {variant === 'category' ? (
        <Skeleton className="h-10 w-20 rounded-lg" />
      ) : (
        <Skeleton className="ml-auto hidden h-5 w-48 rounded-md md:block" />
      )}
      <Skeleton circle width={16} height={16} className={variant === 'category' ? '' : 'ml-auto'} />
    </div>
  )
}

/** Mirrors the per-resource management lists (endpoints, categories, …). */
export function AdminRowsSkeleton({ rows = 4, variant }: { rows?: number; variant: AdminRowVariant }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <RowSkeleton key={index} variant={variant} />
      ))}
    </div>
  )
}

/**
 * Mirrors the overview tab: stat cards, request history chart, and the
 * per-endpoint traffic table.
 */
export function AdminOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <AdminStatCardsSkeleton />
      <AdminChartSkeleton />
      <AdminTableSkeleton />
    </div>
  )
}
