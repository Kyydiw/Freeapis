import { Skeleton } from './Skeleton'
import { cn } from '@/utils/cn'

export interface SkeletonAvatarProps {
  size?: number | string
  className?: string
  dark?: boolean
}

/** Rounded square icon/avatar placeholder (matches CategoryIcon boxes). */
export function SkeletonAvatar({ size = 36, className, dark }: SkeletonAvatarProps) {
  return <Skeleton dark={dark} width={size} height={size} className={cn('rounded-[10px]', className)} />
}
