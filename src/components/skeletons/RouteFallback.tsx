import { Skeleton } from './Skeleton'
import { SkeletonRegion } from './SkeletonRegion'

/**
 * Lightweight fallback for lazy route chunks. Deliberately minimal —
 * just enough motion to say "loading" without evoking the removed
 * full-screen transition.
 */
export function RouteFallback() {
  return (
    <SkeletonRegion label="Loading page" className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3" aria-hidden="true">
        <Skeleton circle width={12} height={12} />
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-2.5 w-28" />
      </div>
    </SkeletonRegion>
  )
}
