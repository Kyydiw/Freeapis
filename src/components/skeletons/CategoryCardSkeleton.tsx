import { Skeleton } from './Skeleton'
import { SkeletonAvatar } from './SkeletonAvatar'
import { cn } from '@/utils/cn'

/**
 * Mirrors CategoryCard (home page grid): icon block, index + name line,
 * description line, and the trailing chevron circle.
 */
export function CategoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-full min-h-[84px] items-center gap-3.5 rounded-[14px] border border-line bg-paper-raised/70 px-[18px] py-4',
        className,
      )}
    >
      <SkeletonAvatar size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="mt-1.5 h-3 w-[82%]" />
      </div>
      <Skeleton circle width={28} height={28} className="shrink-0" />
    </div>
  )
}
