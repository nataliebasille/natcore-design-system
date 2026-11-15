'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { twMerge } from 'tailwind-merge'
import type { OutlineHeading } from '../doc/doc-outline'
import { ChevronDownIcon, SearchIcon } from '../icons'
import {
  useKeyboardShortcut,
  useShortcutLabel,
  type KeyboardShortcut,
} from '@/ui/hooks/use-keyboard-shortcut'
import { useBreakpoint } from '@/ui/hooks/use-breakpoint'
import { useSidebar } from './sidebar-provider'

const SEARCH_SHORTCUT: KeyboardShortcut = { key: 'k', mod: true }
const noop = () => {}

const ExpandedGroupsContext = createContext<{
  expanded: ReadonlySet<string>
  toggle: (key: string) => void
}>({ expanded: new Set(), toggle: () => {} })

/**
 * Tracks which groups are open. The current page's groups open on navigation;
 * the reader's own opening and closing is kept.
 */
export function SidebarNavProvider({
  groupKeysByHref,
  children,
}: {
  groupKeysByHref: Record<string, string[]>
  children: ReactNode
}) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(groupKeysByHref[pathname])
  )

  useEffect(() => {
    const keys = groupKeysByHref[pathname] ?? []
    setExpanded((current) =>
      keys.every((key) => current.has(key)) ? current : new Set([...current, ...keys])
    )
  }, [groupKeysByHref, pathname])

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      return next
    })

  return (
    <ExpandedGroupsContext.Provider value={{ expanded, toggle }}>
      {children}
    </ExpandedGroupsContext.Provider>
  )
}

/** The search box. Search isn't wired up yet; the shortcut only focuses it. */
export function SidebarSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const shortcutLabel = useShortcutLabel(SEARCH_SHORTCUT)
  // Below tablet the sidebar is a closed tray and there's rarely a keyboard,
  // so the shortcut does nothing and the browser's own Ctrl/⌘K runs.
  const tablet = useBreakpoint('>= tablet')
  useKeyboardShortcut(SEARCH_SHORTCUT, tablet ? focusInput : noop)

  function focusInput(event: KeyboardEvent) {
    event.preventDefault()
    inputRef.current?.focus()
  }

  return (
    <div className="sticky top-0 z-10 bg-inherit p-3">
      <div className="form-control text-sm">
        <span data-slot="prefix">
          <SearchIcon className="size-4 text-surface-950/50" />
        </span>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search docs"
          aria-label="Search docs"
          className="[&::-webkit-search-cancel-button]:hidden"
        />
        <span data-slot="suffix">
          <kbd className="rounded border border-surface-600/30 px-1.5 text-xs whitespace-nowrap text-surface-950/50 max-tablet:hidden">
            {shortcutLabel}
          </kbd>
        </span>
      </div>
    </div>
  )
}

/** A collapsible group. Its pages are rendered on the server and hidden when closed. */
export function NavGroup({
  groupKey,
  label,
  count,
  nested,
  children,
}: {
  groupKey: string
  label: string
  count: number
  nested: boolean
  children: ReactNode
}) {
  const { expanded, toggle } = useContext(ExpandedGroupsContext)
  const open = expanded.has(groupKey)
  const id = useId()

  return (
    <div className={twMerge('mb-1', nested && 'ml-3')}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => toggle(groupKey)}
        className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 font-semibold text-surface-950/80 hover:bg-surface-200"
      >
        <ChevronDownIcon
          className={twMerge('size-4 transition-transform', !open && '-rotate-90')}
        />
        {label}
        <span className="ml-auto rounded-full bg-surface-200 px-1.5 text-[0.65rem] font-normal text-surface-950/55">
          {count}
        </span>
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  )
}

/** A page in the sidebar. The current page lists its headings underneath. */
export function PageLink({
  href,
  label,
  headings,
}: {
  href: string
  label: string
  /** The page's top-level headings, listed while it's the current page. */
  headings: OutlineHeading[]
}) {
  const pathname = usePathname()
  const { close } = useSidebar()
  const active = href === pathname

  return (
    <li>
      <Link
        href={href}
        onClick={close}
        aria-current={active ? 'page' : undefined}
        className={twMerge(
          '-ml-px block border-l-2 border-transparent py-1.5 pr-2 pl-3 text-surface-950/65 hover:border-surface-600/50 hover:text-surface-950',
          active && 'border-accent-500 font-medium text-primary-600 hover:border-accent-500'
        )}
      >
        {label}
      </Link>
      {active && <PageOutline headings={headings} />}
    </li>
  )
}

/** The current page's top-level headings, highlighting the one in view. */
function PageOutline({ headings }: { headings: OutlineHeading[] }) {
  const current = useCurrentHeading(headings.map((heading) => heading.id))
  const { close } = useSidebar()

  if (headings.length === 0) return null

  return (
    <ul className="mb-2 ml-3 flex flex-col">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            onClick={(event) => {
              close()
              scrollToHeading(heading.id)(event)
            }}
            aria-current={current === heading.id ? 'location' : undefined}
            className={twMerge(
              'block truncate py-1 pl-3 text-xs text-surface-950/50 hover:text-surface-950',
              current === heading.id && "text-accent-600 before:mr-1 before:content-['›']"
            )}
          >
            {heading.title}
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * The last heading scrolled past the top of its scroll container, or the last
 * heading once the container is scrolled to the bottom.
 */
function useCurrentHeading(ids: string[]) {
  const [current, setCurrent] = useState<string | null>(null)
  const key = ids.join('\n')

  useEffect(() => {
    const headings = key
      .split('\n')
      .map((id) => document.getElementById(id))
      .filter((heading) => heading !== null)
    const scroller = headings[0]?.closest('main')
    if (!scroller) return

    function update() {
      const top = scroller!.getBoundingClientRect().top + 120
      const atBottom =
        scroller!.scrollTop > 0 &&
        scroller!.scrollTop + scroller!.clientHeight >= scroller!.scrollHeight - 2
      const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= top)
      setCurrent((atBottom ? headings.at(-1) : passed.at(-1))?.id ?? null)
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })
    return () => scroller.removeEventListener('scroll', update)
  }, [key])

  return current
}

/**
 * Scrolls only the heading's scroll container. `scrollIntoView` would also
 * scroll the page itself when a docs example overflows it, hiding the header.
 */
function scrollToHeading(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id)
    const scroller = target?.closest('main')
    if (!target || !scroller) return

    event.preventDefault()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const offset =
      target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      parseFloat(getComputedStyle(target).scrollMarginTop || '0')
    scroller.scrollTo({
      top: scroller.scrollTop + offset,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
    window.history.pushState(null, '', `#${id}`)
  }
}
