import 'server-only'
import { docsModuleDefault } from '@/utlls/docs-module'
import {
  resolveDocLocation,
  toDocModel,
  type DocLocation,
  type DocModel,
} from '@nataliebasille/css-engine'
import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

export type DocsEntry = DocLocation &
  (
    | {
        /** A `*.docs.tsx` in core-v2. */
        source: 'colocated'
        /** Path under core-v2's `src/`, without `.docs.tsx`. */
        module: string
      }
    | {
        /** A not-yet-migrated `app/(docs)/_<category>/<name>/doc.tsx` folder. */
        source: 'legacy'
        category: string[]
        name: string
      }
  )

export type DocsNavNode =
  | { kind: 'link'; label: string; href: string; order?: number }
  | { kind: 'group'; label: string; children: DocsNavNode[]; order?: number }

const DOCS_SUFFIX = '.docs.tsx'

/**
 * Every docs page: each `*.docs.tsx` under core-v2's `src/`, placed by its
 * file location and `<Page nav>`, then legacy folders not yet migrated.
 */
export const listDocsEntries = cache(async (): Promise<DocsEntry[]> => {
  const colocated = await Promise.all(
    (await findDocsModules()).map(async (module): Promise<DocsEntry> => {
      const model = await loadDocsModule(module)
      return { ...resolveDocLocation(module, model), source: 'colocated', module }
    })
  )
  const taken = new Set(colocated.map(pathKey))
  const legacy = (await listLegacyEntries()).filter((entry) => !taken.has(pathKey(entry)))

  return [...colocated, ...legacy]
})

export async function findDocsEntry(segments: string[]) {
  const target = segments.join('/')
  return (await listDocsEntries()).find((entry) => pathKey(entry) === target)
}

export async function loadDocsModule(module: string): Promise<DocModel> {
  // Static `.docs.tsx` suffix so Turbopack only bundles docs modules.
  const mod: unknown = await import(`../../packages/core-v2/src/${module}.docs.tsx`)
  return toDocModel(docsModuleDefault(mod))
}

/**
 * The sidebar tree. Within a level, nodes sort by `order` (lowest first), then
 * pages before sub-groups, then label. A group's order is its lowest page order.
 */
export function buildDocsNav(entries: DocsEntry[]): DocsNavNode[] {
  const root: DocsNavNode[] = []

  for (const entry of entries) {
    let level = root
    for (const label of entry.group) {
      let group = level.find(
        (node): node is Extract<DocsNavNode, { kind: 'group' }> =>
          node.kind === 'group' && node.label === label
      )
      if (!group) {
        group = { kind: 'group', label, children: [] }
        level.push(group)
      }
      group.order = minOrder(group.order, entry.order)
      level = group.children
    }

    level.push({
      kind: 'link',
      label: entry.label,
      href: `/${entry.path.join('/')}`,
      ...(entry.order !== undefined ? { order: entry.order } : {}),
    })
  }

  return sortNav(root)
}

function sortNav(nodes: DocsNavNode[]): DocsNavNode[] {
  return nodes
    .map((node) => (node.kind === 'group' ? { ...node, children: sortNav(node.children) } : node))
    .sort(
      (a, b) =>
        (a.order ?? Infinity) - (b.order ?? Infinity) ||
        kindRank(a) - kindRank(b) ||
        a.label.localeCompare(b.label)
    )
}

function kindRank(node: DocsNavNode) {
  return node.kind === 'link' ? 0 : 1
}

function minOrder(a: number | undefined, b: number | undefined) {
  return a === undefined ? b : b === undefined ? a : Math.min(a, b)
}

function pathKey(entry: DocsEntry) {
  return entry.path.join('/')
}

async function findDocsModules() {
  const files = await readdir(srcDir(), { recursive: true })

  return files
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => file.endsWith(DOCS_SUFFIX))
    .map((file) => file.slice(0, -DOCS_SUFFIX.length))
    .sort()
}

async function listLegacyEntries(): Promise<DocsEntry[]> {
  const docsDir = path.resolve(process.cwd(), 'app/(docs)')
  const entries: DocsEntry[] = []

  for (const group of await readdir(docsDir, { withFileTypes: true })) {
    if (!group.isDirectory() || !group.name.startsWith('_')) continue

    const category = group.name.slice(1)
    for (const item of await readdir(path.join(docsDir, group.name), { withFileTypes: true })) {
      if (!item.isDirectory()) continue

      const folder = path.join(docsDir, group.name, item.name)
      if (
        (await exists(path.join(folder, 'doc.tsx'))) &&
        (await exists(path.join(folder, 'playground.tsx')))
      ) {
        entries.push({
          path: [category, item.name],
          group: [capitalize(category)],
          label: capitalize(item.name),
          source: 'legacy',
          category: [category],
          name: item.name,
        })
      }
    }
  }

  return entries
}

function srcDir() {
  return path.resolve(process.cwd(), '../packages/core-v2/src')
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

async function exists(file: string) {
  return access(file).then(
    () => true,
    () => false
  )
}
