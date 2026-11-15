import type { DocsNavNode } from '@/server/docs-index'
import { twMerge } from 'tailwind-merge'
import type { OutlineHeading } from '../doc/doc-outline'
import { Overline } from '../layout/overline'
import { NavGroup, PageLink, SidebarNavProvider, SidebarSearch } from './sidebar-content.client'
import {
  groupKey,
  indexSidebarSections,
  type SidebarIndex,
  type SidebarSection,
} from './sidebar-sections'
import { SidebarToggle } from './sidebar-toggle'

type NavLinkNode = Extract<DocsNavNode, { kind: 'link' }>
type NavGroupNode = Extract<DocsNavNode, { kind: 'group' }>

/**
 * Docs navigation: a search box, then the sections with their pages. Rendered
 * on the server; only the parts that depend on the current page or the
 * reader's clicks are client components.
 */
export function Sidebar({
  sections,
  outlines,
  className,
}: {
  sections: SidebarSection[]
  /** Each page's top-level headings, by URL. */
  outlines: Record<string, OutlineHeading[]>
  className?: string
}) {
  const { groupKeysByHref, pageCounts } = indexSidebarSections(sections)

  return (
    <aside className={twMerge('max-tablet:tray-left', className)}>
      <SidebarToggle />
      <SidebarSearch />

      <SidebarNavProvider groupKeysByHref={groupKeysByHref}>
        <nav aria-label="Docs" className="px-2 pb-6 text-sm">
          {sections.map((section, index) => (
            <div key={section.label}>
              <Overline
                className={twMerge(
                  'mb-1 px-2 text-[0.65rem] text-surface-950/45',
                  index === 0 ? 'mt-1' : 'mt-5'
                )}
              >
                {section.label}
              </Overline>
              <NavItems
                items={section.items}
                trail={[section.label]}
                pageCounts={pageCounts}
                outlines={outlines}
              />
            </div>
          ))}
        </nav>
      </SidebarNavProvider>
    </aside>
  )
}

/** Links render as one bordered list per run; groups collapse. */
function NavItems({
  items,
  trail,
  pageCounts,
  outlines,
}: {
  items: DocsNavNode[]
  trail: string[]
  pageCounts: SidebarIndex['pageCounts']
  outlines: Record<string, OutlineHeading[]>
}) {
  return runsOf(items).map((run) => {
    if (Array.isArray(run)) {
      return (
        <ul key={run[0]!.href} className="mb-1 ml-4 border-l border-surface-600/25">
          {run.map((link) => (
            <PageLink
              key={link.href}
              href={link.href}
              label={link.label}
              headings={outlines[link.href] ?? []}
            />
          ))}
        </ul>
      )
    }

    const groupTrail = [...trail, run.label]
    const key = groupKey(groupTrail)
    return (
      <NavGroup
        key={key}
        groupKey={key}
        label={run.label}
        count={pageCounts[key] ?? 0}
        nested={trail.length > 1}
      >
        <NavItems
          items={run.children}
          trail={groupTrail}
          pageCounts={pageCounts}
          outlines={outlines}
        />
      </NavGroup>
    )
  })
}

function runsOf(items: DocsNavNode[]) {
  const runs: (NavLinkNode[] | NavGroupNode)[] = []
  for (const item of items) {
    const last = runs.at(-1)
    if (item.kind === 'group') runs.push(item)
    else if (Array.isArray(last)) last.push(item)
    else runs.push([item])
  }
  return runs
}
