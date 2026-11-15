import { Skeleton } from './Skeleton'
import { SkeletonAvatar } from './SkeletonAvatar'
import { SkeletonButton } from './SkeletonButton'
import { SkeletonText } from './SkeletonText'
import { cn } from '@/utils/cn'

function SectionSkeleton({ titleWidth = 'w-36', children }: { titleWidth?: string; children?: React.ReactNode }) {
  return (
    <section className="mt-10" aria-hidden="true">
      <Skeleton className={cn('h-5', titleWidth)} />
      <div className="mt-4">{children}</div>
    </section>
  )
}

function TableSkeleton({ rows = 4, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper-raised" aria-hidden="true">
      <div className="min-w-[560px]">
        <div
          className="grid gap-4 border-b border-line-muted px-4 py-2.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }, (_, index) => (
            <Skeleton key={index} className="h-3 w-3/4" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 border-b border-line-muted px-4 py-3 last:border-0"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }, (_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-3"
                style={{ width: colIndex === 0 ? '90%' : `${55 + ((rowIndex + colIndex) % 3) * 12}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function CodeBlockSkeleton({ lines = 7, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-navy-border bg-navy p-4', className)} aria-hidden="true">
      <SkeletonText dark lines={lines} className="gap-2.5" lineClassName="h-2.5" />
    </div>
  )
}

/**
 * Mirrors the API detail page end to end: back link, header block with
 * actions, endpoint URL bar, parameters table, request/response code
 * blocks, schema table, and the closing CTA card — so the loaded page
 * swaps in without any layout shift.
 */
export function ApiDetailSkeleton() {
  return (
    <div className="shell py-14 md:py-20">
      <Skeleton className="h-4 w-56" />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <SkeletonAvatar size={40} />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <Skeleton className="mt-4 h-10 w-[min(440px,90%)] md:h-12" />
          <SkeletonText lines={2} className="mt-4 w-full max-w-[560px]" lineClassName="h-4" />
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
          <SkeletonButton width={186} height={48} />
          <SkeletonButton width={186} height={48} />
        </div>
      </div>

      <div
        className="mt-8 flex h-[54px] items-center gap-3 rounded-xl border border-navy-border bg-navy px-4"
        aria-hidden="true"
      >
        <Skeleton dark className="h-6 w-[52px] rounded-md" />
        <Skeleton dark className="h-4 flex-1" />
        <Skeleton dark className="h-6 w-[54px] rounded-md" />
        <Skeleton dark circle width={30} height={30} />
      </div>

      <SectionSkeleton titleWidth="w-40">
        <SkeletonText lines={2} lineClassName="h-3.5" className="max-w-[72ch]" />
      </SectionSkeleton>

      <SectionSkeleton titleWidth="w-48">
        <TableSkeleton rows={4} cols={6} />
      </SectionSkeleton>

      <SectionSkeleton titleWidth="w-64">
        <CodeBlockSkeleton />
      </SectionSkeleton>

      <SectionSkeleton titleWidth="w-44">
        <CodeBlockSkeleton lines={9} />
      </SectionSkeleton>

      <SectionSkeleton titleWidth="w-44">
        <TableSkeleton rows={4} cols={3} />
      </SectionSkeleton>

      <div className="mt-12 rounded-2xl border border-line bg-paper-raised p-6 md:p-8" aria-hidden="true">
        <Skeleton className="h-6 w-40" />
        <SkeletonText lines={2} className="mt-3 max-w-lg" lineClassName="h-3.5" />
        <SkeletonButton width={190} height={48} className="mt-5" />
      </div>
    </div>
  )
}
