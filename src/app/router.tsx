import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { RouteFallback } from '@/components/skeletons'
import { useCatalogPrefetch } from '@/hooks/useCatalog'
import { HomePage } from '@/pages/HomePage'

const ApiExplorerPage = lazy(() => import('@/pages/ApiExplorerPage'))
const ApiDetailPage = lazy(() => import('@/pages/ApiDetailPage'))
const PlaygroundPage = lazy(() => import('@/pages/PlaygroundPage'))
const DocumentationPage = lazy(() => import('@/pages/DocumentationPage'))
const StatusPage = lazy(() => import('@/pages/StatusPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/**
 * Warm the lazy chunks of the public pages and the catalog cache once the
 * browser is idle, so first navigation to data-heavy routes feels instant.
 * Admin is skipped: it is auth-gated and pulls the Supabase client.
 */
function useIdleWarmup() {
  useEffect(() => {
    const warm = () => {
      void Promise.all([
        import('@/pages/ApiExplorerPage'),
        import('@/pages/ApiDetailPage'),
        import('@/pages/PlaygroundPage'),
        import('@/pages/DocumentationPage'),
        import('@/pages/StatusPage'),
        import('@/pages/AboutPage'),
      ]).catch(() => undefined)
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warm)
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(warm, 1200)
    return () => window.clearTimeout(id)
  }, [])
}

export function RouterProvider() {
  useIdleWarmup()
  useCatalogPrefetch()

  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/apis" element={<ApiExplorerPage />} />
          <Route path="/apis/:category/:endpoint" element={<ApiDetailPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
