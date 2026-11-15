import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCatalog, fetchStatus, filterEndpoints } from '@/services/api/catalog'
import type { ApiEndpoint } from '@/services/api/api.types'

/** The catalog changes rarely; five minutes keeps navigations instant. */
export const CATALOG_STALE_TIME = 5 * 60 * 1000
export const STATUS_STALE_TIME = 60 * 1000

export const catalogQueryOptions = {
  queryKey: ['catalog'],
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchCatalog(signal),
  staleTime: CATALOG_STALE_TIME,
} as const

export const statusQueryOptions = {
  queryKey: ['platform-status'],
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchStatus(signal),
  staleTime: STATUS_STALE_TIME,
} as const

export function useCatalog() {
  return useQuery(catalogQueryOptions)
}

/**
 * Prefetch the catalog once the browser is idle so the Explorer, Search
 * dialog, API detail pages, and playground open with data already cached.
 * Awaits nothing on the critical path; failures are ignored (the first
 * real query will surface them).
 */
export function useCatalogPrefetch() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const warm = () => {
      void queryClient.prefetchQuery(catalogQueryOptions).catch(() => undefined)
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warm)
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(warm, 1500)
    return () => window.clearTimeout(id)
  }, [queryClient])
}

export function useCatalogCategories() {
  const query = useCatalog()
  return { ...query, data: query.data?.categories }
}

export function useCatalogEndpoints() {
  const query = useCatalog()
  return { ...query, data: query.data?.endpoints }
}

export function useEndpointSearch(endpoints: ApiEndpoint[] | undefined, query: string, limit = 8): ApiEndpoint[] {
  if (!endpoints) return []
  return filterEndpoints(endpoints, query).slice(0, limit)
}

export function usePlatformStatus() {
  return useQuery(statusQueryOptions)
}
