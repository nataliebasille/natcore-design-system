'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { twMerge } from 'tailwind-merge'
import { CloseIcon, SearchIcon } from '../icons'
import { useBreakpoint } from '@/ui/hooks/use-breakpoint'
import {
  preloadDocsSearch,
  useDocsSearch,
  type PageResult,
  type SectionResult,
} from '@/ui/hooks/use-docs-search'
import {
  useKeyboardShortcut,
  useShortcutLabel,
  type KeyboardShortcut,
} from '@/ui/hooks/use-keyboard-shortcut'
import { scrollToHeading } from './sidebar-content.client'
import { useSidebar } from './sidebar-provider'

const SEARCH_SHORTCUT: KeyboardShortcut = { key: 'k', mod: true }
const noop = () => {}

/**
 * The search box, above `children` (the nav). While there's a query, matching
 * pages and their sections replace the nav, which stays mounted so its open
 * groups survive. The results stay while you move between them; Esc or the
 * clear button brings the nav back.
 */
export function SidebarSearch({ children }: { children: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const shortcutLabel = useShortcutLabel(SEARCH_SHORTCUT)
  // Below tablet the sidebar is a closed tray and there's rarely a keyboard,
  // so the shortcut does nothing and the browser's own Ctrl/⌘K runs.
  const tablet = useBreakpoint('>= tablet')
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const { term, status, pages, retry } = useDocsSearch(query)
  const results = pages.flatMap((page) => [page, ...page.sections])
  const active = results[activeIndex]

  useKeyboardShortcut(SEARCH_SHORTCUT, tablet ? focusInput : noop)

  function focusInput(event: KeyboardEvent) {
    event.preventDefault()
    inputRef.current?.focus()
    inputRef.current?.select()
  }

  function search(value: string) {
    setQuery(value)
    setActiveIndex(0)
    inputRef.current?.closest('aside')?.scrollTo({ top: 0 })
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      const next = (activeIndex + step + results.length) % results.length
      setActiveIndex(next)
      document
        .getElementById(optionId(listboxId, results[next]!))
        ?.scrollIntoView({ block: 'nearest' })
    } else if (event.key === 'Enter' && active) {
      event.preventDefault()
      // Goes through the link's own click handling.
      document.getElementById(optionId(listboxId, active))?.querySelector('a')?.click()
    } else if (event.key === 'Escape' && query) {
      event.preventDefault()
      search('')
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-inherit p-3">
        <div className="form-control text-sm">
          <span data-slot="prefix">
            <SearchIcon className="size-4 text-surface-950/50" />
          </span>
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            placeholder="Search docs"
            aria-label="Search docs"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={active ? optionId(listboxId, active) : undefined}
            autoComplete="off"
            spellCheck={false}
            className="[&::-webkit-search-cancel-button]:hidden"
            value={query}
            onChange={(event) => search(event.target.value)}
            onFocus={preloadDocsSearch}
            onKeyDown={onKeyDown}
          />
          <span data-slot="suffix">
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                className="flex rounded p-0.5 text-surface-950/50 hover:bg-surface-200 hover:text-surface-950"
                onClick={() => {
                  search('')
                  inputRef.current?.focus()
                }}
              >
                <CloseIcon className="size-4" />
              </button>
            ) : (
              <kbd className="rounded border border-surface-600/30 px-1.5 text-xs whitespace-nowrap text-surface-950/50 max-tablet:hidden">
                {shortcutLabel}
              </kbd>
            )}
          </span>
        </div>
      </div>

      <div hidden={!term} className="px-2 pb-6 text-sm">
        <p aria-live="polite" className="mb-2 px-2 text-xs text-surface-950/50">
          {status === 'loading'
            ? 'Searching…'
            : status === 'missing'
              ? 'The search index hasn’t been built. Run pnpm build to generate it.'
              : status === 'ready' && pages.length === 0
                ? `No results for “${term}”.`
                : status === 'ready'
                  ? `${pages.length} ${pages.length === 1 ? 'page' : 'pages'}`
                  : status === 'error'
                    ? 'Search failed.'
                    : null}
          {status === 'error' && (
            <button
              type="button"
              className="ml-1 underline hover:text-surface-950"
              onClick={() => {
                retry()
                inputRef.current?.focus()
              }}
            >
              Try again
            </button>
          )}
        </p>
        <div id={listboxId} role="listbox" aria-label="Search results">
          {pages.map((page) => (
            <PageResultGroup
              key={page.id}
              page={page}
              listboxId={listboxId}
              activeId={active?.id}
              onHover={(result) => setActiveIndex(results.indexOf(result))}
            />
          ))}
        </div>
      </div>

      <div hidden={!!term}>{children}</div>
    </>
  )
}

/** A matching page, then its matching sections as a bordered list, like the nav. */
function PageResultGroup({
  page,
  listboxId,
  activeId,
  onHover,
}: {
  page: PageResult
  listboxId: string
  activeId: string | undefined
  onHover: (result: PageResult | SectionResult) => void
}) {
  const navigate = useResultNavigation()
  const hasSections = page.sections.length > 0

  return (
    <div role="group" aria-label={page.title} className="mb-2">
      <div
        id={optionId(listboxId, page)}
        role="option"
        aria-selected={page.id === activeId}
        className="scroll-mt-16"
        onMouseMove={() => onHover(page)}
      >
        <Link
          href={page.url}
          tabIndex={-1}
          onClick={navigate(page.url)}
          className={twMerge(
            'block rounded-md px-2 py-1.5 font-semibold text-surface-950/80 hover:bg-surface-200',
            page.id === activeId && 'bg-surface-200'
          )}
        >
          {page.title}
          {!hasSections && <Excerpt html={page.excerpt} />}
        </Link>
      </div>

      {hasSections && (
        <div className="mb-1 ml-4 border-l border-surface-600/25">
          {page.sections.map((section) => (
            <div
              key={section.id}
              id={optionId(listboxId, section)}
              role="option"
              aria-selected={section.id === activeId}
              className="scroll-mt-16"
              onMouseMove={() => onHover(section)}
            >
              <Link
                href={section.url}
                tabIndex={-1}
                onClick={navigate(section.url)}
                className={twMerge(
                  '-ml-px block border-l-2 border-transparent py-1.5 pr-2 pl-3 text-surface-950/65 hover:border-surface-600/50 hover:text-surface-950',
                  section.id === activeId &&
                    'border-accent-500 text-surface-950 hover:border-accent-500'
                )}
              >
                {section.title}
                <Excerpt html={section.excerpt} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Pagefind's excerpt: escaped text with the matches wrapped in `<mark>`. */
function Excerpt({ html }: { html: string }) {
  return (
    <span
      className="mt-0.5 line-clamp-2 block text-xs font-normal wrap-anywhere text-surface-950/50 [&_mark]:rounded-sm [&_mark]:bg-accent-200 [&_mark]:text-on-accent-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Closes the tray on small screens. A section on the current page scrolls the
 * same way the nav's heading links do. Modified and non-primary clicks (open
 * in a new tab or window) are left to the browser.
 */
function useResultNavigation() {
  const pathname = usePathname()
  const { close } = useSidebar()

  return (url: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    close()
    const [path, hash] = url.split('#')
    if (hash && path === pathname) scrollToHeading(hash)(event)
  }
}

function optionId(listboxId: string, result: PageResult | SectionResult) {
  return `${listboxId}-${result.id.replace(/[^\w-]/g, '_')}`
}
