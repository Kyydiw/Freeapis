import { useMemo } from 'react'
import { cn } from '@/utils/cn'
import { highlightCode } from './highlight'

export interface JsonViewProps {
  data: unknown
  className?: string
}

/**
 * Compact inline JSON renderer used where a full CodeBlock toolbar is not
 * appropriate (e.g. the homepage live console). Syntax colors come from the
 * shared `.code-surface` + `.language-json` token theme, which keeps the
 * original console palette (keys #c8cfe4, strings #e8e9ee, numbers #f2b56b).
 */
export function JsonView({ data, className }: JsonViewProps) {
  const text = useMemo(
    () => (data === undefined ? '' : JSON.stringify(data, null, 2)),
    [data],
  )
  const html = useMemo(() => highlightCode(text, 'json'), [text])

  return (
    <pre
      className={cn(
        'code-surface overflow-x-auto font-mono text-[12.5px] leading-[1.8] text-[#8b93ab]',
        className,
      )}
    >
      <code className="language-json" dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}
