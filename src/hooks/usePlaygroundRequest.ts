import { useCallback, useMemo, useState } from 'react'
import { request } from '@/services/api/client'
import type { ApiEndpoint, ApiRequestConfig, ApiResponse, HttpMethod } from '@/services/api/api.types'
import { ApiError, NetworkError, TimeoutError, formatApiError } from '@/services/api/api.errors'
import { isBinaryEndpoint } from '@/components/api/CodeExamples'
import { useRequestHistory } from '@/hooks/useRequestHistory'
import type { HistoryEntry } from '@/services/api/requestHistory'

export interface KeyValueRow {
  key: string
  value: string
}

export interface PlaygroundErrorState {
  kind: 'api' | 'network' | 'timeout'
  message: string
  status?: number
  details?: string
  body?: unknown
  headers?: Record<string, string>
  rawText?: string
}

export type PlayState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; response: ApiResponse<Record<string, unknown>> }
  | { phase: 'error'; error: PlaygroundErrorState }

function toErrorState(error: unknown): PlaygroundErrorState {
  if (error instanceof ApiError) {
    return {
      kind: 'api',
      message: error.message,
      status: error.code,
      details: error.details,
      body: error.body,
      headers: error.headers,
      rawText: error.rawText,
    }
  }
  if (error instanceof TimeoutError) {
    return { kind: 'timeout', message: error.message }
  }
  if (error instanceof NetworkError) {
    return { kind: 'network', message: error.message }
  }
  return { kind: 'network', message: formatApiError(error) }
}

/**
 * Owns the playground request lifecycle: composer state, derived request
 * config, preset application, sending, and history integration. The page and
 * its panels stay presentational on top of this hook.
 */
export function usePlaygroundRequest(endpoints: ApiEndpoint[]) {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [path, setPath] = useState('/api/v1/tools/info')
  const [queryRows, setQueryRows] = useState<KeyValueRow[]>([])
  const [headerRows, setHeaderRows] = useState<KeyValueRow[]>([
    { key: 'Accept', value: 'application/json' },
  ])
  const [bodyText, setBodyText] = useState('')
  const [state, setState] = useState<PlayState>({ phase: 'idle' })
  const history = useRequestHistory()

  const config: ApiRequestConfig = useMemo(() => {
    const query: Record<string, string> = {}
    queryRows.forEach((r) => r.key && (query[r.key] = r.value))
    const headers: Record<string, string> = {}
    headerRows.forEach((r) => r.key && (headers[r.key] = r.value))
    let body: Record<string, unknown> | null = null
    if (bodyText.trim()) {
      try {
        body = JSON.parse(bodyText)
      } catch {
        body = null
      }
    }
    return { method, path, query, headers: Object.keys(headers).length ? headers : undefined, body }
  }, [method, path, queryRows, headerRows, bodyText])

  const bodyValid = useMemo(() => {
    if (!bodyText.trim()) return true
    try {
      JSON.parse(bodyText)
      return true
    } catch {
      return false
    }
  }, [bodyText])

  const matchedEndpoint = useMemo(
    () => endpoints.find((e) => e.path === path.split('?')[0]),
    [endpoints, path],
  )

  const binaryMode =
    (matchedEndpoint ? isBinaryEndpoint(matchedEndpoint) : false) ||
    (state.phase === 'done' && Boolean(state.response.binary))

  const applyEndpoint = useCallback((endpoint: ApiEndpoint) => {
    setMethod(endpoint.method)
    setPath(endpoint.path)
    setQueryRows(
      endpoint.params
        .filter((p) => p.location === 'query' && p.example !== undefined)
        .map((p) => ({ key: p.name, value: String(p.example) })),
    )
    const bodyDefaults = Object.fromEntries(
      endpoint.params
        .filter((param) => param.location === 'body')
        .map((param) => [
          param.name,
          param.example ?? `YOUR_${param.name.replace(/[^a-z0-9]+/gi, '_').toUpperCase()}`,
        ]),
    )
    const exampleBody = { ...(endpoint.requestExample ?? {}), ...bodyDefaults }
    setBodyText(Object.keys(exampleBody).length ? JSON.stringify(exampleBody, null, 2) : '')
    setHeaderRows(
      isBinaryEndpoint(endpoint) ? [] : [{ key: 'Accept', value: 'application/json' }],
    )
    setState({ phase: 'idle' })
  }, [])

  const formatBody = useCallback(() => {
    if (!bodyText.trim()) return
    try {
      const parsed = JSON.parse(bodyText) as unknown
      setBodyText(JSON.stringify(parsed, null, 2))
    } catch {
      /* invalid JSON is surfaced by the composer; nothing to format */
    }
  }, [bodyText])

  const send = useCallback(
    async (override?: ApiRequestConfig) => {
      const target = override ?? config
      setState({ phase: 'loading' })
      try {
        const response = await request<Record<string, unknown>>(target)
        setState({ phase: 'done', response })
        history.record(target, {
          status: response.status,
          durationMs: response.durationMs,
          sizeBytes: response.sizeBytes,
          binary: Boolean(response.binary),
          error: null,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setState({ phase: 'idle' })
          return
        }
        const errorState = toErrorState(error)
        setState({ phase: 'error', error: errorState })
        history.record(target, {
          status: error instanceof ApiError ? error.code : null,
          durationMs: error instanceof ApiError ? (error.durationMs ?? null) : null,
          sizeBytes: error instanceof ApiError ? (error.sizeBytes ?? null) : null,
          binary: false,
          error: errorState.message,
        })
      }
    },
    [config, history],
  )

  const loadEntry = useCallback((entry: HistoryEntry) => {
    const { request: stored } = entry
    setMethod(stored.method)
    setPath(stored.path)
    setQueryRows(Object.entries(stored.query ?? {}).map(([key, value]) => ({ key, value })))
    setHeaderRows(Object.entries(stored.headers ?? {}).map(([key, value]) => ({ key, value })))
    setBodyText(stored.body ? JSON.stringify(stored.body, null, 2) : '')
    setState({ phase: 'idle' })
  }, [])

  const rerunEntry = useCallback(
    (entry: HistoryEntry) => {
      if (state.phase === 'loading') return
      loadEntry(entry)
      void send({ ...entry.request })
    },
    [state.phase, loadEntry, send],
  )

  const busy = state.phase === 'loading'

  return {
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
    config,
    state,
    busy,
    matchedEndpoint,
    binaryMode,
    applyEndpoint,
    send,
    loadEntry,
    rerunEntry,
    history,
  }
}

export type PlaygroundController = ReturnType<typeof usePlaygroundRequest>
