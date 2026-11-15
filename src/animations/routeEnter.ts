import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { gsap, ScrollTrigger, DUR, MQ } from './gsap.setup'

/**
 * Route-level enter behaviour that replaces the old curtain transition:
 *
 * - Navigation is instant; React Router swaps the route immediately.
 * - As an additive polish step, elements marked with `data-enter` get a
 *   short fade/slide reveal before first paint of the new route.
 * - PUSH/REPLACE navigations reset scroll to the top; POP keeps the
 *   browser's restored position so back/forward behave natively.
 * - `prefers-reduced-motion` skips every animation; content is simply
 *   visible.
 */
export function useRouteEnter() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const prevPathname = useRef<string | null>(null)

  useLayoutEffect(() => {
    const initial = prevPathname.current === null
    const changed = prevPathname.current !== location.pathname
    prevPathname.current = location.pathname
    if (!changed) return undefined

    if (!initial && navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }

    const main = document.querySelector('main')
    if (!main) return undefined
    const items = gsap.utils.toArray<HTMLElement>('[data-enter]', main)
    if (items.length === 0) return undefined
    if (window.matchMedia(MQ.reduced).matches) return undefined

    gsap.set(items, { autoAlpha: 0, y: 24 })
    const tl = gsap.timeline({
      onComplete: () => {
        ScrollTrigger.refresh()
      },
    })
    tl.to(items, {
      autoAlpha: 1,
      y: 0,
      duration: DUR.enter,
      stagger: DUR.stagger,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    })

    return () => {
      tl.kill()
      gsap.set(items, { clearProps: 'transform,opacity,visibility' })
    }
  }, [location.pathname, navigationType])
}
