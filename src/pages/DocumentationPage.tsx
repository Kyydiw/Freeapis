import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Link2, Menu, Search, X } from 'lucide-react'
import { CodeBlock } from '@/components/code/CodeBlock'
import { DataTable } from '@/components/ui/DataTable'
import { EndpointBadge } from '@/components/api/EndpointBadge'
import { useActiveSection } from '@/hooks/useActiveSection'
import { docSections } from '@/data/documentation'
import type { DocBlock, DocSection } from '@/data/documentation'
import { cn } from '@/utils/cn'

const sectionIds = docSections.map((s) => s.id)

function blockMatchesQuery(block: DocBlock, q: string): boolean {
  switch (block.kind) {
    case 'p':
      return block.text.toLowerCase().includes(q)
    case 'code':
      return block.code.toLowerCase().includes(q)
    case 'list':
      return block.items.some((item) => item.toLowerCase().includes(q))
    case 'table':
      return (
        block.head.some((h) => h.toLowerCase().includes(q)) ||
        block.rows.some((row) => row.some((cell) => cell.toLowerCase().includes(q)))
      )
  }
}

function sectionMatchesQuery(section: DocSection, q: string): boolean {
  if (section.title.toLowerCase().includes(q)) return true
  return section.blocks.some((block) => blockMatchesQuery(block, q))
}

function DocBlockView({ block }: { block: DocBlock }) {
  if (block.kind === 'p')
    return (
      <p className="max-w-[72ch] font-body text-[15px] leading-[1.75] text-ink-soft">
        {block.text}
      </p>
    )
  if (block.kind === 'code')
    return (
      <CodeBlock
        code={block.code}
        language={block.language}
        showLineNumbers={block.code.split('\n').length >= 8}
      />
    )
  if (block.kind === 'list')
    return (
      <ul className="flex max-w-[72ch] flex-col gap-2.5">
        {block.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 font-body text-[14px] leading-relaxed text-ink-soft"
          >
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    )
  return (
    <DataTable
      head={block.head}
      rows={block.rows.map((row) =>
        row.map((cell, j) =>
          j === 0 ? (
            <code key={j} className="font-mono text-xs font-semibold text-cobalt">
              {cell}
            </code>
          ) : (
            cell
          ),
        ),
      )}
    />
  )
}

export default function DocumentationPage() {
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeId = useActiveSection(sectionIds)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return docSections
    return docSections.filter((s) => sectionMatchesQuery(s, q))
  }, [query])

  const sidebarNav = (
    <nav className="flex flex-col gap-0.5" aria-label="Documentation sections">
      {docSections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={() => setDrawerOpen(false)}
          aria-current={activeId === s.id ? 'location' : undefined}
          className={cn(
            'rounded-lg px-3 py-2 font-body text-sm transition-colors',
            activeId === s.id
              ? 'bg-navy text-white'
              : 'text-ink-soft hover:bg-paper-soft hover:text-ink',
          )}
        >
          {s.title}
        </a>
      ))}
    </nav>
  )

  const searchInput = (
    <div className="flex h-11 items-center gap-2.5 rounded-[10px] border border-line bg-paper-raised px-3.5 focus-within:border-cobalt">
      <Search size={16} className="shrink-0 text-ink-soft" aria-hidden="true" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search documentation"
        className="h-full w-full bg-transparent font-body text-sm text-ink placeholder:text-ink-soft focus:outline-none"
        aria-label="Search documentation"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:text-ink"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )

  return (
    <div className="shell py-10 md:py-14">
      <div className="mb-8">
        <p data-enter className="eyebrow">DOCUMENTATION</p>
        <h1 data-enter className="mt-3 font-display text-[36px] font-bold leading-[1.08] text-ink md:text-[44px]">
          Read the docs. Ship faster.
        </h1>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_190px]">
        <div className="hidden lg:block">
          <div className="sticky top-28 flex flex-col gap-5">
            {searchInput}
            {sidebarNav}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-6 grid min-w-0 grid-cols-[auto_1fr] items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-paper-raised px-4 font-body text-sm font-semibold text-ink"
              aria-expanded={drawerOpen}
              aria-controls="docs-sections-drawer"
            >
              {drawerOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}{' '}
              Sections
            </button>
            {searchInput}
          </div>

          {drawerOpen && (
            <div
              id="docs-sections-drawer"
              className="mb-6 rounded-xl border border-line bg-paper-raised p-3 lg:hidden"
            >
              {sidebarNav}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper-soft py-20 text-center">
              <p className="font-body text-sm font-semibold text-ink">
                No sections match “{query.trim()}”
              </p>
              <p className="mt-1 font-body text-[13px] text-ink-soft">
                Try another keyword such as “rate limit”, “envelope”, or “error”.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-4 rounded-lg border border-line px-4 py-2 font-body text-sm font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-14">
              {filtered.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-28" aria-labelledby={`${s.id}-heading`}>
                  <h2
                    id={`${s.id}-heading`}
                    className="group flex scroll-mt-28 items-center gap-3 font-display text-[26px] font-bold leading-tight text-ink"
                  >
                    <BookOpen size={20} className="-mt-0.5 shrink-0 text-cobalt" aria-hidden="true" />
                    <span className="min-w-0">{s.title}</span>
                    <a
                      href={`#${s.id}`}
                      aria-label={`Link to the ${s.title} section`}
                      className="ml-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-soft opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Link2 size={15} aria-hidden="true" />
                    </a>
                  </h2>
                  <div className="mt-6 flex flex-col gap-5">
                    {s.blocks.map((b, i) => (
                      <DocBlockView key={i} block={b} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="mt-16 rounded-2xl border border-line bg-paper-raised p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-ink">Try everything in the playground</h2>
            <p className="mt-2 max-w-lg font-body text-sm leading-relaxed text-ink-soft">
              Every documented endpoint has a preset. Load one and fire a live request in seconds —
              no setup, no API key.
            </p>
            <Link to="/playground" className="btn-primary mt-5 h-12 px-6 text-sm">
              Open Playground
            </Link>
          </div>
        </div>

        <aside className="hidden xl:block" aria-label="On this page">
          <div className="sticky top-28">
            <p className="mb-3 font-body text-[11px] font-bold uppercase tracking-wideCaps text-ink-soft">
              On this page
            </p>
            <nav className="flex flex-col border-l border-line-muted">
              {docSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={activeId === s.id ? 'location' : undefined}
                  className={cn(
                    '-ml-px border-l-2 py-1.5 pl-3.5 font-body text-[13px] leading-snug transition-colors',
                    activeId === s.id
                      ? 'border-cobalt font-semibold text-ink'
                      : 'border-transparent text-ink-soft hover:border-line hover:text-ink',
                  )}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 hidden items-center gap-2 rounded-full border border-line bg-paper-raised px-4 py-2 shadow-dropdown xl:flex">
        <EndpointBadge method="GET" />
        <code className="font-mono text-xs text-ink">/api/v1/docs</code>
      </div>
    </div>
  )
}
