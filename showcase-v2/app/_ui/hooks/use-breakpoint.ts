'use client'

import { useCallback, useSyncExternalStore } from 'react'

/** The `--breakpoint-*` names in globals.css's `@theme static` block. */
export type Breakpoint = 'tablet' | 'desktop'

/** A screen-width comparison against a breakpoint, e.g. `'>= tablet'` or `'< desktop'`. */
export type BreakpointQuery = `${'<' | '<=' | '>' | '>='} ${Breakpoint}`

/**
 * Whether the screen width satisfies `query`. `'>= tablet'` matches the same
 * widths as Tailwind's `tablet:` prefix, `'< tablet'` the same as `max-tablet:`.
 * Reads the `--breakpoint-<name>` theme variable (emitted by `@theme static` in
 * globals.css). `false` on the server.
 */
export function useBreakpoint(query: BreakpointQuery) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = mediaQueryList(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query]
  )

  return useSyncExternalStore(
    subscribe,
    () => mediaQueryList(query).matches,
    () => false
  )
}

// Breakpoints don't change at runtime, so each query's list is built once.
// Reading the theme variable can force a full style recalculation.
const mediaQueryLists = new Map<BreakpointQuery, MediaQueryList>()

function mediaQueryList(query: BreakpointQuery) {
  let media = mediaQueryLists.get(query)
  if (!media) {
    media = window.matchMedia(toMediaQuery(query))
    // Don't cache a miss: the stylesheet may not have loaded yet.
    if (media.media !== 'not all') mediaQueryLists.set(query, media)
  }
  return media
}

function toMediaQuery(query: BreakpointQuery) {
  const [operator, breakpoint] = query.split(' ')
  const width = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${breakpoint}`)
    .trim()
  return width ? `(width ${operator} ${width})` : 'not all'
}
