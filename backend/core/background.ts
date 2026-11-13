type WaitUntil = (promise: Promise<unknown>) => void

let waitUntilImpl: WaitUntil | null | undefined

// @vercel/functions is loaded lazily and optionally. A static import would crash
// the whole function at cold start (FUNCTION_INVOCATION_FAILED) if the package
// is missing from the install. Without it, background work simply runs
// best-effort and request handling is unaffected.
function loadWaitUntil(): WaitUntil | null {
  if (waitUntilImpl !== undefined) return waitUntilImpl
  try {
    const mod = typeof require === 'function' ? (require('@vercel/functions') as { waitUntil?: unknown }) : null
    waitUntilImpl = typeof mod?.waitUntil === 'function' ? (mod.waitUntil as WaitUntil) : null
  } catch {
    waitUntilImpl = null
  }
  return waitUntilImpl
}

export function background(task: Promise<unknown>): void {
  const waitUntil = loadWaitUntil()
  try {
    if (waitUntil) {
      waitUntil(task)
      return
    }
  } catch {
    // fall through to fire-and-forget
  }
  void task.catch(() => undefined)
}
