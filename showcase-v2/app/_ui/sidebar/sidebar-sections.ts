import type { DocsNavNode } from '@/server/docs-index'

export type SidebarSection = { label: string; items: DocsNavNode[] }

/** Top-level docs groups, in sidebar order. Others follow alphabetically. */
const SECTION_ORDER = ['Getting Started', 'Foundations', 'Typography', 'Components']

/**
 * The sidebar's top level: one section per top-level docs group. A docs page
 * with no group goes under Getting Started.
 */
export function buildSidebarSections(nav: DocsNavNode[]): SidebarSection[] {
  const ungrouped = nav.filter((node) => node.kind === 'link')
  const sections = nav
    .filter((node) => node.kind === 'group')
    .map((group) => ({ label: group.label, items: group.children }))

  if (ungrouped.length > 0) {
    const gettingStarted = sections.find((section) => section.label === 'Getting Started')
    if (gettingStarted) gettingStarted.items.push(...ungrouped)
    else sections.push({ label: 'Getting Started', items: ungrouped })
  }

  return sections.sort(
    (a, b) => sectionRank(a.label) - sectionRank(b.label) || a.label.localeCompare(b.label)
  )
}

export type SidebarIndex = {
  /** The keys of the groups containing each page, outermost first. */
  groupKeysByHref: Record<string, string[]>
  /** The number of pages under each group, nested groups included. */
  pageCounts: Record<string, number>
}

/** A group's key: its section and group labels, joined with `/`. */
export function groupKey(trail: string[]) {
  return trail.join('/')
}

/**
 * Walks the sections once, without recursion, so the sidebar can find the
 * current page's groups with a single lookup.
 */
export function indexSidebarSections(sections: SidebarSection[]): SidebarIndex {
  const groupKeysByHref: Record<string, string[]> = {}
  const pageCounts: Record<string, number> = {}
  const pending = sections.map((section) => ({
    items: section.items,
    trail: [section.label],
    groupKeys: [] as string[],
  }))

  for (let next = pending.pop(); next; next = pending.pop()) {
    for (const item of next.items) {
      if (item.kind === 'link') {
        groupKeysByHref[item.href] = next.groupKeys
        for (const key of next.groupKeys) pageCounts[key] = (pageCounts[key] ?? 0) + 1
      } else {
        const trail = [...next.trail, item.label]
        pending.push({
          items: item.children,
          trail,
          groupKeys: [...next.groupKeys, groupKey(trail)],
        })
      }
    }
  }

  return { groupKeysByHref, pageCounts }
}

function sectionRank(label: string) {
  const index = SECTION_ORDER.indexOf(label)
  return index === -1 ? SECTION_ORDER.length : index
}
