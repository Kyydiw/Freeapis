import { useMemo, useState } from 'react'
import { Clock, RotateCcw, Terminal, WifiOff } from 'lucide-react'
import type { PlayState } from '@/hooks/usePlaygroundRequest'
import { BinaryResponseViewer } from '@/components/api/ResponseViewer'
import { CodeBlock } from '@/components/code/CodeBlock'
import { CopyButton } from '@/components/code/CopyButton'
import { Tabs } from '@/components/ui/Tabs'
import { cn } from '@/utils/cn'

type ResponseTab = 'body' | 'headers' | 'raw'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(2)} KB`
}

function formatHeadersText(headers: Record<string, string> | undefined): string {
  if (!headers) return ''
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

function HeadersTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers)
  return (
    <div className="code-scroll max-h-[480px] overflow-y-auto" role="table" aria-label="Response headers">
      {entries.map(([key, value]) => (
        <div
          key={key}
          role="row"
          className="grid grid-cols-[minmax(120px,220px)_1fr] gap-4 border-b border-navy-border/60 px-4 py-2.5 last:border-0"
        >
          <span role="rowheader" className="min-w-0 break-all font-mono text-xs text-[#9dd0ff]">
            {key}
          </span>
          <span role="cell" className="min-w-0 break-all font-mono text-xs text-[#c8cfe4]">
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatusPill({ status, statusText }: { status: number; statusText?: string }) {
  const ok = status >= 200 && status < 400
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold text-white',
        ok ? 'bg-success' : 'bg-signal',
      )}
    >
      {status}
      {statusText ? ` ${statusText}` : ''}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-navy-border bg-[#141b2c] text-[#8b93ab]">
        <Terminal size={18} aria-hidden="true" />
      </span>
      <p className="font-body text-sm font-semibold text-[#c8cfe4]">No request yet</p>
      <p className="max-w-[320px] font-mono text-[11px] leading-relaxed text-[#6c7390]">
        Pick an endpoint preset, adjust params/headers/body, then press Send.
        The response envelope appears here.
      </p>
    </div>
  )
}

function NetworkErrorState({ kind, message }: { kind: 'network' | 'timeout'; message: string }) {
  const isTimeout = kind === 'timeout'
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-signal/30 bg-signal/10 text-signal">
        {isTimeout ? <Clock size={18} aria-hidden="true" /> : <WifiOff size={18} aria-hidden="true" />}
      </span>
      <p className="font-body text-sm font-semibold text-white">
        {isTimeout ? 'Request timed out' : 'Network error'}
      </p>
      <p className="max-w-[380px] font-mono text-[11px] leading-relaxed text-[#8b93ab]">{message}</p>
      <p className="max-w-[380px] font-mono text-[11px] leading-relaxed text-[#6c7390]">
        {isTimeout
          ? 'The API did not answer within 30 seconds. Heavier endpoints can be slow — try again.'
          : 'The request never reached the Kyyinfinite API. Check your connection and try again.'}
      </p>
    </div>
  )
}

export interface ResponsePanelProps {
  state: PlayState
}

/**
 * Response inspector: status/duration/size/content-type metadata, Body /
 * Headers / Raw views with syntax highlighting, and distinct treatment for
 * API errors versus network/timeout failures.
 */
export function ResponsePanel({ state }: ResponsePanelProps) {
  const [tab, setTab] = useState<ResponseTab>('body')

  const done = state.phase === 'done' ? state.response : null
  const apiError = state.phase === 'error' && state.error.kind === 'api' ? state.error : null
  const hasBody = Boolean(done && !done.binary) || Boolean(apiError && apiError.body !== undefined)
  const hasRaw = Boolean(done?.rawText) || Boolean(apiError?.rawText)
  const headers = done?.headers ?? apiError?.headers
  const hasHeaders = Boolean(headers && Object.keys(headers).length > 0)

  const bodyCode = useMemo(() => {
    if (done && !done.binary) return JSON.stringify(done.data, null, 2)
    if (apiError && apiError.body !== undefined) return JSON.stringify(apiError.body, null, 2)
    return ''
  }, [done, apiError])

  const rawText = done?.rawText ?? apiError?.rawText ?? ''

  const copyValue =
    tab === 'headers' && hasHeaders
      ? formatHeadersText(headers)
      : tab === 'raw' && hasRaw
        ? rawText
        : hasBody
          ? bodyCode
          : ''
  const copyLabel =
    tab === 'headers' ? 'Copy headers' : tab === 'raw' ? 'Copy raw' : 'Copy response'

  const dotTone =
    state.phase === 'error'
      ? 'bg-signal'
      : state.phase === 'done'
        ? 'bg-success'
        : 'bg-[#4a5168]'

  return (
    <section
      aria-label="API response"
      className="min-w-0 overflow-hidden rounded-2xl border border-navy-border bg-navy"
    >
      <div className="flex min-h-[54px] flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-navy-border px-4 py-3">
        <span className="flex items-center gap-2.5 font-body text-xs font-bold tracking-[0.06em] text-white">
          <span className={cn('h-2.5 w-2.5 rounded-full', dotTone)} aria-hidden="true" />
          RESPONSE
        </span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px]">
          {done && (
            <>
              <StatusPill status={done.status} statusText={done.statusText} />
              <span className="text-success" title="Response duration">
                {done.durationMs} ms
              </span>
              <span className="text-[#8b93ab]" title="Response size">
                {formatBytes(done.sizeBytes)}
              </span>
              {done.contentType && (
                <span
                  className="max-w-[220px] truncate text-[#6c7390]"
                  title={`Content type: ${done.contentType}`}
                >
                  {done.contentType}
                </span>
              )}
            </>
          )}
          {apiError && (
            <>
              <StatusPill status={apiError.status ?? 0} />
              {apiError.message && <span className="text-[#c8cfe4]">{apiError.message}</span>}
            </>
          )}
          {state.phase === 'error' && state.error.kind !== 'api' && (
            <span className="rounded-full bg-signal px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
              {state.error.kind === 'timeout' ? 'TIMEOUT' : 'NETWORK ERROR'}
            </span>
          )}
        </div>
      </div>

      {(hasBody || hasHeaders || hasRaw) && (
        <div className="border-b border-navy-border px-3 pt-1.5">
          <Tabs
            variant="navy"
            ariaLabel="Response views"
            value={tab}
            onChange={setTab}
            items={[
              ...(hasBody ? [{ id: 'body' as const, label: 'Body' }] : []),
              ...(hasHeaders ? [{ id: 'headers' as const, label: 'Headers' }] : []),
              ...(hasRaw ? [{ id: 'raw' as const, label: 'Raw' }] : []),
            ]}
          />
        </div>
      )}

      <div className="min-h-[220px]">
        {state.phase === 'idle' && <EmptyState />}

        {state.phase === 'loading' && (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 py-14">
            <RotateCcw size={20} className="animate-spin text-[#6c7390]" aria-hidden="true" />
            <p className="font-mono text-xs text-[#6c7390]">awaiting response…</p>
          </div>
        )}

        {state.phase === 'error' && state.error.kind !== 'api' && (
          <NetworkErrorState kind={state.error.kind} message={state.error.message} />
        )}

        {state.phase === 'done' && done?.binary && (
          <div className="p-4">
            <BinaryResponseViewer file={done.binary} />
          </div>
        )}

        {tab === 'body' && hasBody && bodyCode && (
          <CodeBlock
            code={bodyCode}
            language="json"
            label={done?.binary ? 'Body' : 'Body · JSON'}
            showLineNumbers
            showToolbar={false}
            maxHeight={520}
            className="rounded-none border-0"
          />
        )}

        {tab === 'headers' && hasHeaders && headers && <HeadersTable headers={headers} />}

        {tab === 'raw' && hasRaw && (
          <CodeBlock
            code={rawText}
            language="json"
            label="Raw body"
            showToolbar={false}
            maxHeight={520}
            className="rounded-none border-0"
          />
        )}
      </div>

      {(done || apiError) && (
        <div className="flex items-center justify-between gap-3 border-t border-navy-border px-4 py-2.5">
          <span className="truncate font-mono text-[10px] uppercase tracking-wideCaps text-[#4a5168]">
            live response · kyyinfinite api
          </span>
          {copyValue && <CopyButton value={copyValue} onDark label={copyLabel} srLabel={copyLabel} />}
        </div>
      )}
    </section>
  )
}
