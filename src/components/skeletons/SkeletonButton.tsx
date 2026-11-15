import { Skeleton } from './Skeleton'
import { cn } from '@/utils/cn'

export interface SkeletonButtonProps {
  width?: number | string
  height?: number | string
  className?: string
  dark?: boolean
}

/** Pill-shaped action placeholder matching the platform's button heights. */
export function SkeletonButton({ width = 120, height = 44, className, dark }: SkeletonButtonProps) {
  return <Skeleton dark={dark} width={width} height={height} className={cn('rounded-[10px]', className)} />
}
