import { useState } from 'react'
import { ChevronDown, Play, RotateCcw, Terminal, Braces } from 'lucide-react'
import type { ApiCategory, ApiEndpoint, HttpMethod } from '@/services/api/api.types'
import type { PlaygroundController } from '@/hooks/usePlaygroundRequest'
import { KeyValueEditor } from './KeyValueEditor'
import { Tabs } from '@/components/ui/Tabs'
import { CopyButton } from '@/components/code/CopyButton'
import { cn } from '@/utils/cn'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

type RequestTab = 'params' | 'headers' | 'body'

export interface RequestComposerProps {
  playground: PlaygroundController
  endpoints: ApiEndpoint[]
  categories: ApiCategory[]
}

/**
 * Request workspace: HTTP method + path + send action, an endpoint preset
 * picker backed by the live catalog, and a tabbed configuration area for
 * params, headers, and body — replacing the old stack of separate cards.
 */
export function RequestComposer({ playground, endpoints, categories }: RequestComposerProps) {
  const [tab, setTab] = useState<RequestTab>('params')
  const {
    method,
    setMethod,
    path,
    setPath,
    queryRows,
    setQueryRows,
    headerRows,
    setHeaderRows,
    bodyText,
    setBodyText,
    bodyValid,
    formatBody,
    busy,
    matchedEndpoint,
    applyEndpoint,
    send,
  } = playground

  const filledQuery = queryRows.filter((r) => r.key.trim()).length
  const filledHeaders = headerRows.filter((r) => r.key.trim()).length
  const canFormat = bodyValid && bodyText.trim().length > 0

  const presetValue = matchedEndpoint?.id ?? ''

  return (
    <section
      aria-label="Request configuration"
      className="min-w-0 rounded-2xl border border-line bg-paper-raised"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line-muted px-5 py-3.5">
        <p className="font-body text-[11px] font-bold uppercase tracking-wideCaps text-ink-soft">
          Request
        </p>
        <span className="flex items-center gap-1.5 rounded-md border border-line-muted bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
          <Terminal size={11} aria-hidden="true" /> live api
        </span>
      </header>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex gap-2">
          <div className="relative shrink-0">
            <label className="sr-only" htmlFor="playground-method">
              HTTP method
            </label>
            <select
              id="playground-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="h-11 appearance-none rounded-[10px] border border-line bg-paper px-3.5 pr-8 font-mono text-sm font-bold text-ink focus:border-cobalt focus:outline-none"
            >
              {METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="playground-path">
              Endpoint path
            </label>
            <input
              id="playground-path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              spellCheck={false}
              placeholder="/api/v1/…"
              className="h-11 w-full min-w-0 rounded-[10px] border border-line bg-paper px-3.5 font-mono text-sm text-ink focus:border-cobalt focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !bodyValid}
            className={cn(
              'btn-primary h-11 shrink-0 px-5 text-sm',
              (busy || !bodyValid) && 'cursor-not-allowed opacity-60 active:translate-y-0',
            )}
          >
            {busy ? (
              <>
                <RotateCcw size={15} className="animate-spin" aria-hidden="true" /> Sending…
              </>
            ) : (
              <>
                <Play size={15} aria-hidden="true" /> Send
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <label className="sr-only" htmlFor="playground-preset">
              Endpoint preset
            </label>
            <select
              id="playground-preset"
              value={presetValue}
              onChange={(e) => {
                const endpoint = endpoints.find((ep) => ep.id === e.target.value)
                if (endpoint) applyEndpoint(endpoint)
              }}
              className="h-9 w-full appearance-none rounded-[10px] border border-line-muted bg-paper px-3 pr-8 font-mono text-xs text-ink focus:border-cobalt focus:outline-none"
            >
              <option value="">
                {matchedEndpoint ? 'Custom path (edit to match an endpoint)' : 'Custom request — no preset'}
              </option>
              {categories.map((category) => {
                const group = endpoints.filter((ep) => ep.category === category.id)
                if (group.length === 0) return null
                return (
                  <optgroup key={category.id} label={category.name}>
                    {group.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {ep.title}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
              aria-hidden="true"
            />
          </div>
          <CopyButton value={`${method} ${path}`} label="Copy endpoint" className="h-9" />
        </div>

        {matchedEndpoint && (
          <p className="-mt-1 font-mono text-[11px] text-ink-soft">
            matches:{' '}
            <span className="text-ink">{matchedEndpoint.title}</span>
            {' · '}
            {matchedEndpoint.method} {matchedEndpoint.path}
          </p>
        )}

        <div>
          <Tabs
            variant="segmented"
            ariaLabel="Request configuration sections"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'params', label: 'Params', count: filledQuery },
              { id: 'headers', label: 'Headers', count: filledHeaders },
              { id: 'body', label: 'Body' },
            ]}
          />

          <div className="mt-3" role="tabpanel" aria-label="Request configuration editor">
            {tab === 'params' && (
              <KeyValueEditor
                rows={queryRows}
                onChange={setQueryRows}
                noun="parameter"
                placeholderKey="name"
                placeholderValue="value"
                emptyHint="No query parameters — add one or load an endpoint preset."
              />
            )}
            {tab === 'headers' && (
              <KeyValueEditor
                rows={headerRows}
                onChange={setHeaderRows}
                noun="header"
                placeholderKey="Header-Name"
                placeholderValue="value"
                emptyHint="No headers — binary endpoints are sent without an Accept header."
              />
            )}
            {tab === 'body' && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-body text-xs text-ink-soft">
                    JSON request body
                  </p>
                  <div className="flex items-center gap-2">
                    {!bodyValid && (
                      <span className="font-mono text-[11px] font-semibold text-signal" role="alert">
                        invalid JSON
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={formatBody}
                      disabled={!canFormat}
                      className={cn(
                        'inline-flex h-7 items-center gap-1.5 rounded-lg border bg-paper px-2.5 font-body text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt',
                        canFormat
                          ? 'border-line text-ink-soft transition-colors hover:border-cobalt hover:text-cobalt'
                          : 'cursor-not-allowed border-line text-ink-soft opacity-50',
                      )}
                    >
                      <Braces size={12} aria-hidden="true" /> Format
                    </button>
                  </div>
                </div>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={7}
                  spellCheck={false}
                  placeholder={
                    method === 'GET'
                      ? 'GET requests usually have no body…'
                      : '{ "key": "value" }'
                  }
                  aria-label="JSON request body"
                  aria-invalid={!bodyValid}
                  className={cn(
                    'w-full rounded-lg border bg-paper px-3.5 py-3 font-mono text-xs leading-relaxed text-ink focus:outline-none',
                    bodyValid ? 'border-line focus:border-cobalt' : 'border-signal',
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
