import { useEffect, useState } from 'react'

/**
 * Tracks which section id is currently in the reading zone of the viewport.
 * Shared by the docs sidebar navigation and the on-page table of contents so
 * both indicators stay in sync while scrolling.
 */
export function useActiveSection(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the topmost intersecting entry so fast scrolls land on the
        // section the reader is entering, not the one they are leaving.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const first = visible[0]
        if (first) setActiveId(first.target.id)
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids.join('|')])

  return activeId
}
