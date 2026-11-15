import { useMemo, useState } from 'react'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, FlaskConical } from 'lucide-react'
import { useCatalog } from '@/hooks/useCatalog'
import { EndpointBadge } from '@/components/api/EndpointBadge'
import { CodeBlock } from '@/components/code/CodeBlock'
import { CopyButton } from '@/components/code/CopyButton'
import { DataTable } from '@/components/ui/DataTable'
import { Tabs } from '@/components/ui/Tabs'
import { PageContainer } from '@/components/layout/PageContainer'
import { ApiDetailSkeleton, SkeletonRegion } from '@/components/skeletons'
import { buildCurl, buildFetch, buildPython, isBinaryEndpoint } from '@/components/api/CodeExamples'
import type { ApiRequestConfig } from '@/services/api/api.types'
import { environment } from '@/config/environment'
import { site } from '@/config/site'
import NotFoundPage from './NotFoundPage'

type ExampleLanguage = 'curl' | 'fetch' | 'python'

const exampleTabs = [
  { id: 'curl' as const, label: 'cURL' },
  { id: 'fetch' as const, label: 'JavaScript' },
  { id: 'python' as const, label: 'Python' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10" aria-label={title}>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function jsonBlock(payload: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(payload, null, 2)
}

export default function ApiDetailPage() {
  const { category, endpoint: endpointId } = useParams()
  const { data, isPending, isError, refetch } = useCatalog()
  const endpoint = useMemo(
    () =>
      category && endpointId
        ? data?.endpoints.find((e) => e.category === category && e.id === endpointId)
        : undefined,
    [data, category, endpointId],
  )
  const categoryName = data?.categories.find((c) => c.id === endpoint?.category)?.name
  const [exampleTab, setExampleTab] = useState<ExampleLanguage>('curl')

  const exampleConfig = useMemo<ApiRequestConfig | null>(() => {
    if (!endpoint) return null
    const query: Record<string, string> = {}
    const body: Record<string, unknown> = { ...(endpoint.requestExample ?? {}) }
    endpoint.params.forEach((param) => {
      const value = param.example ?? `YOUR_${param.name.replace(/[^a-z0-9]+/gi, '_').toUpperCase()}`
      if (param.location === 'query') query[param.name] = String(value)
      if (param.location === 'body') body[param.name] = value
    })
    const headers = Object.fromEntries(endpoint.headers.map((header) => [
      header.name, header.name.toLowerCase() === 'content-type' ? 'application/json' : `YOUR_${header.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
    ]))
    return {
      method: endpoint.method,
      path: endpoint.path,
      query,
      headers: Object.keys(headers).length ? headers : undefined,
      body: Object.keys(body).length ? body : null,
    }
  }, [endpoint])

  const baseUrl = environment.apiBaseUrl || site.url
  const snippetOptions = { binary: endpoint ? isBinaryEndpoint(endpoint) : false }
  const exampleCode = useMemo(() => {
    if (!exampleConfig) return ''
    if (exampleTab === 'curl') return buildCurl(exampleConfig, baseUrl, snippetOptions)
    if (exampleTab === 'python') return buildPython(exampleConfig, baseUrl, snippetOptions)
    return buildFetch(exampleConfig, baseUrl, snippetOptions)
  }, [exampleConfig, exampleTab, baseUrl, endpoint])

  const exampleLanguage: string =
    exampleTab === 'curl' ? 'curl' : exampleTab === 'python' ? 'python' : 'javascript'

  if (isPending) {
    return (
      <SkeletonRegion label="Loading endpoint">
        <ApiDetailSkeleton />
      </SkeletonRegion>
    )
  }

  if (isError && !data) {
    return (
      <PageContainer className="py-10 md:py-14">
        <p className="font-body text-sm font-semibold text-ink">The catalog could not be loaded.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg border border-line px-4 py-2 font-body text-sm font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
        >
          Retry
        </button>
      </PageContainer>
    )
  }

  if (!endpoint) return <NotFoundPage />

  const requestExampleCode = endpoint.requestExample ? jsonBlock(endpoint.requestExample) : ''

  return (
    <PageContainer className="py-10 md:py-14">
      <Link
        to={`/apis?category=${endpoint.category}`}
        className="inline-flex items-center gap-2 font-body text-sm font-semibold text-ink-soft transition-colors hover:text-cobalt"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Back to {categoryName ?? 'explorer'}
      </Link>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div data-enter className="flex items-center gap-3">
            <CategoryIcon slug={endpoint.category} label={categoryName ?? endpoint.category} className="h-10 w-10" />
            <p className="eyebrow">{categoryName?.toUpperCase() ?? 'ENDPOINT'}</p>
          </div>
          <h1 data-enter className="mt-3 font-display text-[34px] font-bold leading-[1.08] text-ink md:text-[42px]">
            {endpoint.title}
          </h1>
          <p data-enter className="mt-4 font-body text-[16px] leading-[1.6] text-ink-soft">
            {endpoint.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            to={`/playground?endpoint=${endpoint.id}`}
            className="btn-primary h-12 px-6 text-sm"
          >
            <FlaskConical size={16} aria-hidden="true" /> Try this API
          </Link>
          <span className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-[1.5px] border-line bg-paper-raised px-6 font-body text-sm font-bold text-ink-soft shadow-tactileLine">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            No authentication required
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-navy-border bg-navy px-4 py-3.5">
        <EndpointBadge method={endpoint.method} onDark />
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-[#c8cfe4]">
          {endpoint.path}
        </code>
        <span className="rounded-md border border-success/40 bg-success/10 px-2 py-1 font-body text-[11px] font-bold text-success">
          FREE
        </span>
        <CopyButton value={endpoint.path} label="Copy path" onDark srLabel="Copy endpoint path" />
      </div>

      <Section title="Authentication">
        <p className="max-w-[72ch] font-body text-sm leading-relaxed text-ink-soft">
          This public endpoint is completely free. Call it directly from any client — no API key, token, or developer signup is required.
        </p>
      </Section>

      {endpoint.params.length > 0 && (
        <Section title="Request parameters">
          <DataTable
            head={['Name', 'In', 'Type', 'Required', 'Example', 'Description']}
            rows={endpoint.params.map((p) => [
              <code key="n" className="whitespace-nowrap font-mono text-xs text-cobalt">
                {p.name}
              </code>,
              <span key="l" className="whitespace-nowrap font-mono text-xs uppercase">
                {p.location}
              </span>,
              <span key="t" className="font-mono text-xs">
                {p.type}
                {p.enumValues ? ` (${p.enumValues.join(' | ')})` : ''}
              </span>,
              p.required ? (
                <span key="r" className="font-semibold text-signal">
                  required
                </span>
              ) : (
                <span key="r">optional</span>
              ),
              <code key="e" className="whitespace-nowrap font-mono text-xs text-ink">{p.example === undefined ? '—' : String(p.example)}</code>,
              <span key="d">{p.description}</span>,
            ])}
          />
        </Section>
      )}

      <Section title="Copy-ready request example">
        <div className="overflow-hidden rounded-xl border border-navy-border bg-navy">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-border px-3 pt-1.5">
            <Tabs
              variant="navy"
              ariaLabel="Request example language"
              value={exampleTab}
              onChange={setExampleTab}
              items={exampleTabs}
            />
          </div>
          <CodeBlock
            code={exampleCode}
            language={exampleLanguage}
            showToolbar={false}
            className="rounded-none border-0"
          />
        </div>
        <p className="mt-2 font-body text-xs leading-relaxed text-ink-soft">
          Replace the <code className="font-mono">YOUR_...</code> sample values with your own input. No API key is needed.
        </p>
      </Section>

      {endpoint.headers.length > 0 && (
        <Section title="Request headers">
          <DataTable
            head={['Header', 'Required', 'Description']}
            rows={endpoint.headers.map((h) => [
              <code key="n" className="whitespace-nowrap font-mono text-xs text-cobalt">
                {h.name}
              </code>,
              h.required ? (
                <span key="r" className="font-semibold text-signal">
                  required
                </span>
              ) : (
                <span key="r">optional</span>
              ),
              <span key="d">{h.description}</span>,
            ])}
          />
        </Section>
      )}

      {requestExampleCode && (
        <Section title="Example request body">
          <CodeBlock
            code={requestExampleCode}
            language="json"
            showLineNumbers={requestExampleCode.split('\n').length >= 8}
          />
        </Section>
      )}

      <Section title="Example response">
        <CodeBlock
          code={jsonBlock(endpoint.responseExample)}
          language="json"
          showLineNumbers={jsonBlock(endpoint.responseExample).split('\n').length >= 8}
        />
      </Section>

      <Section title="Response schema">
        <DataTable
          head={['Field', 'Type', 'Description']}
          rows={endpoint.responseSchema.map((f) => [
            <code key="n" className="whitespace-nowrap font-mono text-xs text-cobalt">
              {f.name}
            </code>,
            <span key="t" className="whitespace-nowrap font-mono text-xs">
              {f.type}
            </span>,
            <span key="d">{f.description}</span>,
          ])}
        />
      </Section>

      <Section title="Error codes">
        <DataTable
          head={['Code', 'Name', 'Description']}
          rows={endpoint.errorCodes.map((e) => [
            <span key="c" className="whitespace-nowrap font-mono text-xs font-bold text-signal">
              {e.code}
            </span>,
            <code key="n" className="whitespace-nowrap font-mono text-xs text-cobalt">
              {e.name}
            </code>,
            <span key="d">{e.description}</span>,
          ])}
        />
      </Section>

      <div className="mt-12 rounded-2xl border border-line bg-paper-raised p-6 md:p-8">
        <h2 className="font-display text-xl font-bold text-ink">Ready to try it?</h2>
        <p className="mt-2 max-w-lg font-body text-sm leading-relaxed text-ink-soft">
          Send a live request from the playground and inspect the response, timing, and size — no setup required.
        </p>
        <Link
          to={`/playground?endpoint=${endpoint.id}`}
          className="btn-primary mt-5 h-12 px-6 text-sm"
        >
          Open in Playground <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </PageContainer>
  )
}
