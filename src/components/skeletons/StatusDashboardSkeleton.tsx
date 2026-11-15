import { Skeleton } from './Skeleton'

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5" aria-hidden="true">
      <div className="flex items-center gap-2.5">
        <Skeleton circle width={10} height={10} />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="mt-2.5 h-3.5 w-56" />
    </div>
  )
}

function ServiceGroupSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5" aria-hidden="true">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton circle width={10} height={10} />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="mt-4 flex h-7 gap-[3px]">
        {Array.from({ length: 30 }, (_, index) => (
          <Skeleton key={index} className="h-full flex-1 rounded-[3px]" />
        ))}
      </div>
      <Skeleton className="mt-2 h-2.5 w-64" />
    </div>
  )
}

function IncidentSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5" aria-hidden="true">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton circle width={17} height={17} />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="ml-auto h-3 w-24" />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-[92%]" />
        <Skeleton className="h-3 w-[48%]" />
      </div>
      <Skeleton className="mt-3 h-2.5 w-40" />
    </div>
  )
}

/**
 * Mirrors the status dashboard: three metric cards, service group rows
 * with 60-day uptime bars, and the incident list.
 */
export function StatusDashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      <section className="mt-10">
        <Skeleton className="h-5 w-44" />
        <div className="mt-4 flex flex-col gap-3">
          <ServiceGroupSkeleton />
          <ServiceGroupSkeleton />
          <ServiceGroupSkeleton />
        </div>
      </section>

      <section className="mt-12">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 flex flex-col gap-3">
          <IncidentSkeleton />
          <IncidentSkeleton />
        </div>
      </section>
    </div>
  )
}
