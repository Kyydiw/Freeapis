import { Skeleton } from './Skeleton'
import { SkeletonAvatar } from './SkeletonAvatar'
import { cn } from '@/utils/cn'

/**
 * Mirrors ApiCard: icon + title + action circle, two summary lines,
 * and the method badge / path pill / FREE chip footer row.
 */
export function ApiCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex flex-col gap-3 rounded-[14px] border border-line bg-paper-raised p-5',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={36} />
        <Skeleton className="h-4 flex-1" />
        <Skeleton circle width={28} height={28} />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-[88%]" />
        <Skeleton className="h-3 w-[62%]" />
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Skeleton className="h-6 w-[52px] rounded-md" />
        <Skeleton className="h-7 flex-1 rounded-md" />
        <Skeleton className="h-7 w-[88px] rounded-md" />
      </div>
    </div>
  )
}
