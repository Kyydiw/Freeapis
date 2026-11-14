import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCatalog } from '@/hooks/useCatalog'
import { usePlaygroundRequest } from '@/hooks/usePlaygroundRequest'
import { RequestComposer } from '@/components/playground/RequestComposer'
import { ResponsePanel } from '@/components/playground/ResponsePanel'
import { SnippetPanel } from '@/components/playground/SnippetPanel'
import { RequestHistory } from '@/components/api/RequestHistory'
import { PageContainer } from '@/components/layout/PageContainer'
import { environment } from '@/config/environment'
import { site } from '@/config/site'

export default function PlaygroundPage() {
  const [searchParams] = useSearchParams()
  const presetId = searchParams.get('endpoint')
  const { data } = useCatalog()
  const endpoints = data?.endpoints ?? []
  const categories = data?.categories ?? []
  const playground = usePlaygroundRequest(endpoints)
  const appliedPreset = useRef<string | null>(null)

  // Deep links such as /playground?endpoint=<id> (from endpoint pages) load
  // the documented preset into the composer exactly once.
  useEffect(() => {
    if (!presetId || endpoints.length === 0 || appliedPreset.current === presetId) return
    const endpoint = endpoints.find((e) => e.id === presetId)
    if (!endpoint) return
    appliedPreset.current = presetId
    playground.applyEndpoint(endpoint)
  }, [presetId, endpoints, playground.applyEndpoint])

  return (
    <PageContainer className="py-10 md:py-14">
      <div className="mb-8">
        <p data-enter className="eyebrow">API PLAYGROUND</p>
        <h1 data-enter className="mt-3 font-display text-[36px] font-bold leading-[1.08] text-ink md:text-[44px]">
          Build, send, inspect.
        </h1>
        <p data-enter className="mt-3 max-w-xl font-body text-[15px] leading-relaxed text-ink-soft">
          Compose requests against every documented endpoint.{' '}
          <span className="font-semibold text-ink">
            This playground sends real requests to the Kyyinfinite API
          </span>{' '}
          — responses come from the live platform.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <RequestComposer playground={playground} endpoints={endpoints} categories={categories} />
          <SnippetPanel
            config={playground.config}
            baseUrl={environment.apiBaseUrl || site.url}
            binaryMode={playground.binaryMode}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <ResponsePanel state={playground.state} />
        </div>
      </div>

      <div className="mt-8">
        <RequestHistory
          entries={playground.history.entries}
          busy={playground.busy}
          onLoad={playground.loadEntry}
          onRerun={playground.rerunEntry}
          onRemove={playground.history.remove}
          onClear={playground.history.clear}
        />
      </div>
    </PageContainer>
  )
}
