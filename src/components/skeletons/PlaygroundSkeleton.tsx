import { Skeleton } from './Skeleton'
import { SkeletonText } from './SkeletonText'
import { cn } from '@/utils/cn'

/**
 * Mirrors the playground's left column while the catalog loads:
 * request composer (method + path + send, preset picker, config tabs,
 * key/value rows) and the snippet panel. The response panel keeps its
 * real idle state — it never shows a skeleton before the first request.
 */
export function PlaygroundSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-6', className)} aria-hidden="true">
      <section className="min-w-0 rounded-2xl border border-line bg-paper-raised">
        <div className="flex items-center justify-between border-b border-line-muted px-5 py-3.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex gap-2">
            <Skeleton className="h-11 w-[104px] rounded-[10px]" />
            <Skeleton className="h-11 min-w-0 flex-1 rounded-[10px]" />
            <Skeleton className="h-11 w-[96px] rounded-[10px]" />
          </div>

          <Skeleton className="h-9 w-full rounded-[10px]" />

          <div className="flex gap-2">
            <Skeleton className="h-8 w-[88px] rounded-lg" />
            <Skeleton className="h-8 w-[96px] rounded-lg" />
            <Skeleton className="h-8 w-[72px] rounded-lg" />
          </div>

          <div className="flex flex-col gap-2">
            {[0, 1].map((row) => (
              <div key={row} className="flex items-center gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-[52px] rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-navy-border bg-navy">
        <div className="flex items-center justify-between border-b border-navy-border px-4 py-3">
          <Skeleton dark className="h-3 w-24" />
          <Skeleton dark className="h-6 w-[88px] rounded-md" />
        </div>
        <div className="p-4">
          <SkeletonText dark lines={5} lineClassName="h-2.5" />
        </div>
      </section>
    </div>
  )
}
