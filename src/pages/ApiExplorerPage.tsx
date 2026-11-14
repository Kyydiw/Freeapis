import { useEffect, useMemo, useState } from 'react'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, Search, X } from 'lucide-react'
import { useCatalog } from '@/hooks/useCatalog'
import { filterEndpoints } from '@/services/api/catalog'
import { ApiCard } from '@/components/api/ApiCard'
import { EndpointRow } from '@/components/api/EndpointRow'
import { Reveal } from '@/components/motion/Reveal'
import { PageContainer } from '@/components/layout/PageContainer'
import { EndpointBadge } from '@/components/api/EndpointBadge'
import { cn } from '@/utils/cn'

const PAGE_SIZE = 9
const VIEW_STORAGE_KEY = 'kyyinfinite.explorer.view.v1'

type ExplorerView = 'grid' | 'list'

function loadViewPreference(): ExplorerView {
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY)
    return stored === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

export default function ApiExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'all'
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [view, setView] = useState<ExplorerView>(loadViewPreference)
  const { data, isLoading, isError, refetch } = useCatalog()
  const categories = data?.categories ?? []
  const endpoints = data?.endpoints ?? []

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view)
    } catch {
      /* storage can be unavailable in private contexts; the view still works */
    }
  }, [view])

  const filtered = useMemo(
    () => filterEndpoints(endpoints, query, activeCategory === 'all' ? undefined : activeCategory),
    [endpoints, query, activeCategory],
  )

  const shown = filtered.slice(0, visible)
  const activeCategoryData = categories.find((c) => c.id === activeCategory)
  const activeCategoryCount = activeCategoryData
    ? endpoints.filter((e) => e.category === activeCategoryData.id).length
    : 0

  const setCategory = (id: string) => {
    setVisible(PAGE_SIZE)
    if (id === 'all') searchParams.delete('category')
    else searchParams.set('category', id)
    setSearchParams(searchParams, { replace: true })
  }

  const clearQuery = () => {
    setQuery('')
    setVisible(PAGE_SIZE)
  }

  const clearCategory = () => setCategory('all')

  return (
    <PageContainer className="py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-4 md:mb-10">
        <div>
          <p data-enter className="eyebrow">API EXPLORER</p>
          <h1 data-enter className="mt-3 font-display text-[36px] font-bold leading-[1.08] text-ink md:text-[44px]">
            Every endpoint, one library.
          </h1>
        </div>
        <div className="flex h-12 max-w-md items-center gap-2.5 rounded-[10px] border border-line bg-paper-raised px-3.5 focus-within:border-cobalt">
          <Search size={17} className="shrink-0 text-ink-soft" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisible(PAGE_SIZE)
            }}
            placeholder="Filter endpoints by name, path, or description…"
            className="h-full w-full bg-transparent font-body text-sm text-ink placeholder:text-ink-soft focus:outline-none"
            aria-label="Filter endpoints"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Clear filter"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:text-ink"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Categories">
          <p className="mb-3 flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-wideCaps text-ink-soft">
            <LayoutGrid size={13} aria-hidden="true" /> Categories
          </p>
          <nav className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-current={activeCategory === 'all' ? 'true' : undefined}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5 text-left font-body text-sm transition-colors',
                activeCategory === 'all'
                  ? 'bg-navy text-white'
                  : 'text-ink hover:bg-paper-soft',
              )}
            >
              All endpoints
              <span className="font-mono text-[11px] opacity-70">{endpoints.length}</span>
            </button>
            {categories.map((c) => {
              const count = endpoints.filter((e) => e.category === c.id).length
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-current={activeCategory === c.id ? 'true' : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-left font-body text-sm transition-colors',
                    activeCategory === c.id
                      ? 'bg-navy text-white'
                      : 'text-ink hover:bg-paper-soft',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <CategoryIcon slug={c.slug} label={c.name} className="h-6 w-6" />
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="font-mono text-[11px] opacity-70">{count}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-6 rounded-xl border border-line bg-paper-raised p-4">
            <p className="font-body text-[13px] font-semibold text-ink">All APIs are free</p>
            <p className="mt-1 font-body text-xs leading-relaxed text-ink-soft">
              No API keys, subscriptions, or billing. Fair-use rate limits protect public services.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          {activeCategoryData && (
            <div className="mb-5 flex flex-wrap items-start gap-4 rounded-2xl border border-line bg-paper-raised p-5">
              <CategoryIcon
                slug={activeCategoryData.slug}
                label={activeCategoryData.name}
                className="h-10 w-10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-xl font-bold text-ink">{activeCategoryData.name}</h2>
                  <p className="font-mono text-xs text-ink-soft">
                    {activeCategoryCount} endpoint{activeCategoryCount === 1 ? '' : 's'}
                  </p>
                </div>
                <p className="mt-1.5 max-w-[70ch] font-body text-[13.5px] leading-relaxed text-ink-soft">
                  {activeCategoryData.description}
                </p>
              </div>
              <button
                type="button"
                onClick={clearCategory}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-paper px-3 font-body text-xs font-semibold text-ink-soft transition-colors hover:border-cobalt hover:text-cobalt"
              >
                <X size={13} aria-hidden="true" /> Clear category
              </button>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-ink-soft">
              <span>
                {filtered.length} endpoint{filtered.length === 1 ? '' : 's'}
              </span>
              {activeCategory !== 'all' && (
                <span>
                  · <span className="text-ink">{activeCategoryData?.name ?? activeCategory}</span>
                </span>
              )}
              {query && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line-muted bg-paper px-2 py-0.5">
                  “{query}”
                  <button
                    type="button"
                    onClick={clearQuery}
                    aria-label="Clear search query"
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    <X size={11} aria-hidden="true" />
                  </button>
                </span>
              )}
            </p>

            <div
              role="group"
              aria-label="Endpoint view"
              className="flex items-center gap-0.5 rounded-[10px] border border-line bg-paper-raised p-1"
            >
              {(
                [
                  { id: 'grid' as const, label: 'Grid', icon: LayoutGrid },
                  { id: 'list' as const, label: 'List', icon: List },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  aria-pressed={view === id}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 font-body text-xs font-semibold transition-colors',
                    view === id ? 'bg-navy text-white' : 'text-ink-soft hover:text-ink',
                  )}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            view === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="h-[172px] animate-pulse rounded-2xl border border-line bg-paper-raised" />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="h-[52px] animate-pulse border-b border-line-muted last:border-0" />
                ))}
              </div>
            )
          ) : isError ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper-soft py-16 text-center">
              <p className="font-body text-sm font-semibold text-ink">The catalog could not be loaded</p>
              <p className="mt-1 font-body text-[13px] text-ink-soft">
                The live catalog powers this page. Check your connection and retry.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-lg border border-line px-4 py-2 font-body text-sm font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
              >
                Retry
              </button>
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper-soft py-16 text-center">
              <p className="font-body text-sm font-semibold text-ink">No endpoints found</p>
              <p className="mt-1 font-body text-[13px] text-ink-soft">
                {query
                  ? 'No endpoint matches the current filter.'
                  : 'This category has no active endpoints right now.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {query && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="rounded-lg border border-line px-4 py-2 font-body text-sm font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                  >
                    Clear search
                  </button>
                )}
                {activeCategory !== 'all' && (
                  <button
                    type="button"
                    onClick={clearCategory}
                    className="rounded-lg border border-line px-4 py-2 font-body text-sm font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                  >
                    View all categories
                  </button>
                )}
              </div>
            </div>
          ) : view === 'grid' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((endpoint, index) => (
                  <Reveal key={endpoint.id} delay={(index % 3) * 0.06} distance={28}>
                    <ApiCard endpoint={endpoint} />
                  </Reveal>
                ))}
              </div>

              {visible < filtered.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="inline-flex h-11 items-center gap-2 rounded-[10px] border-[1.5px] border-line bg-paper-raised px-6 font-body text-sm font-bold text-ink shadow-tactileLine transition-[transform,box-shadow] hover:border-[#c9c4b7] active:translate-y-[3px] active:shadow-[0_1px_0_0_#D8D5CB]"
                  >
                    Load more endpoints
                    <span className="font-mono text-xs text-ink-soft">
                      {visible}/{filtered.length}
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
              {shown.map((endpoint) => (
                <EndpointRow key={endpoint.id} endpoint={endpoint} />
              ))}
              {visible < filtered.length && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + 24)}
                  className="w-full border-t border-line-muted py-3 font-body text-sm font-semibold text-ink-soft transition-colors hover:bg-paper hover:text-cobalt"
                >
                  Show more · {visible}/{filtered.length}
                </button>
              )}
            </div>
          )}

          <div className="mt-14 rounded-2xl border border-line bg-paper-raised p-6 md:p-8">
            <p className="eyebrow">CONSISTENT BY DESIGN</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-ink">
              One response envelope everywhere
            </h2>
            <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-ink-soft">
              Every endpoint answers with the same shape, so your error handling and parsing code
              never changes between categories.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-navy-border bg-navy px-4 py-3">
              <EndpointBadge method="GET" onDark />
              <code className="font-mono text-[13px] text-[#c8cfe4]">/api/v1/any/endpoint</code>
              <span className="ml-auto font-mono text-xs text-success">200 OK · ~120 ms</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
