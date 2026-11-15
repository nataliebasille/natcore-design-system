'use client'

import { useEffect, useState } from 'react'

// Emitted into public/ by `pagefind` after `next build` (see showcase-v2/package.json).
const PAGEFIND_URL = '/pagefind/pagefind.js'
const MAX_PAGES = 10
const MAX_SECTIONS_PER_PAGE = 3

export type SectionResult = { id: string; title: string; url: string; excerpt: string }

export type PageResult = {
  id: string
  title: string
  url: string
  excerpt: string
  sections: SectionResult[]
}

/**
 * - `idle`: nothing typed.
 * - `loading`: results for the current query haven't arrived yet.
 * - `missing`: no index, because `pnpm build` hasn't run.
 */
export type DocsSearchStatus = 'idle' | 'loading' | 'ready' | 'missing'

type PagefindResultData = {
  url: string
  excerpt: string
  meta: { title?: string }
  sub_results: {
    title: string
    url: string
    excerpt: string
    anchor?: { element: string }
  }[]
}

type Pagefind = {
  options: (options: Record<string, unknown>) => Promise<void>
  init: () => Promise<void>
  debouncedSearch: (
    term: string,
    options?: Record<string, unknown>,
    debounceMs?: number
  ) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] } | null>
}

let pagefindPromise: Promise<Pagefind | null> | undefined

/** Searches the Pagefind index for `query`, debounced. Excerpts are HTML with `<mark>`ed matches. */
export function useDocsSearch(query: string) {
  const term = query.trim()
  const [found, setFound] = useState<{ term: string; pages: PageResult[]; missing: boolean }>({
    term: '',
    pages: [],
    missing: false,
  })

  useEffect(() => {
    if (!term) return

    let cancelled = false
    void (async () => {
      const pagefind = await loadPagefind()
      if (cancelled) return
      if (!pagefind) {
        setFound({ term, pages: [], missing: true })
        return
      }

      const search = await pagefind.debouncedSearch(term, {}, 150)
      if (cancelled || !search) return

      const pages = await Promise.all(
        search.results.slice(0, MAX_PAGES).map((result) => result.data())
      )
      if (!cancelled) setFound({ term, pages: pages.map(toPageResult), missing: false })
    })()

    return () => {
      cancelled = true
    }
  }, [term])

  const status: DocsSearchStatus = !term
    ? 'idle'
    : found.missing
      ? 'missing'
      : found.term === term
        ? 'ready'
        : 'loading'

  return { term, status, pages: status === 'ready' ? found.pages : [] }
}

/** Loads the index ahead of the first keystroke. */
export function preloadDocsSearch() {
  void loadPagefind()
}

function loadPagefind() {
  pagefindPromise ??= import(/* webpackIgnore: true */ /* turbopackIgnore: true */ PAGEFIND_URL)
    .then(async (pagefind: Pagefind) => {
      await pagefind.options({ excerptLength: 20 })
      await pagefind.init()
      return pagefind
    })
    .catch(() => null)

  return pagefindPromise
}

function toPageResult(page: PagefindResultData): PageResult {
  const url = toRoute(page.url)
  return {
    id: url,
    title: page.meta.title ?? url,
    url,
    excerpt: page.excerpt,
    sections: page.sub_results
      // A match on the page's <h1>, or before any heading, is the page itself.
      .filter((section) => section.anchor && section.anchor.element !== 'h1')
      .slice(0, MAX_SECTIONS_PER_PAGE)
      .map((section) => ({
        id: toRoute(section.url),
        title: section.title,
        url: toRoute(section.url),
        excerpt: section.excerpt,
      })),
  }
}

// Pagefind indexes Next's prerendered `.html` files; map them back to routes.
function toRoute(url: string) {
  return url.replace(/\/index\.html(?=#|$)/, '/').replace(/\.html(?=#|$)/, '')
}
