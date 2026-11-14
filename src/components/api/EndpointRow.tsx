import { TLink } from '@/components/motion/PageTransition'
import { ArrowUpRight } from 'lucide-react'
import { EndpointBadge } from './EndpointBadge'
import type { ApiEndpoint } from '@/services/api/api.types'

/**
 * Compact single-line endpoint representation for the explorer's list view:
 * `GET  /api/v1/example  description`. Denser than the card grid, which
 * matters with a catalog of ~100 endpoints.
 */
export function EndpointRow({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <TLink
      to={`/apis/${endpoint.category}/${endpoint.id}`}
      className="group flex items-center gap-3 border-b border-line-muted px-4 py-3 transition-colors last:border-0 hover:bg-paper focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cobalt"
    >
      <EndpointBadge method={endpoint.method} />
      <code className="hidden min-w-0 flex-1 truncate font-mono text-[13px] text-ink sm:block">
        {endpoint.path}
      </code>
      <span className="min-w-0 flex-1 truncate font-body text-[13px] font-semibold text-ink group-hover:text-cobalt sm:flex-none sm:basis-[38%]">
        {endpoint.title}
      </span>
      <span className="hidden min-w-0 flex-1 truncate font-body text-[13px] text-ink-soft lg:block">
        {endpoint.summary}
      </span>
      <ArrowUpRight
        size={14}
        className="shrink-0 text-ink-soft transition-colors group-hover:text-cobalt"
        aria-hidden="true"
      />
    </TLink>
  )
}
