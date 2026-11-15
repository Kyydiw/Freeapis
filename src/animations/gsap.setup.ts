import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

export const MQ = {
  reduced: '(prefers-reduced-motion: reduce)',
  motion: '(prefers-reduced-motion: no-preference)',
  finePointer: '(hover: hover) and (pointer: fine)',
  mobile: '(max-width: 760px)',
  desktop: '(min-width: 761px)',
}

export const DUR = { enter: 0.9, stagger: 0.07 }

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(MQ.reduced).matches

export { gsap, ScrollTrigger }
