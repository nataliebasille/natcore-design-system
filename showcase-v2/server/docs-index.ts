import 'server-only'
import { docsModuleDefault } from '@/utlls/docs-module'
import {
  resolveDocLocation,
  toDocModel,
  type DocLocation,
  type DocModel,
} from '@nataliebasille/css-engine'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

export type DocsEntry = DocLocation & {
  /** Path under core-v2's `src/`, without `.docs.tsx`. */
  module: string
}

export type DocsNavNode =
  | { kind: 'link'; label: string; href: string; order?: number }
  | { kind: 'group'; label: string; children: DocsNavNode[]; order?: number }

const DOCS_SUFFIX = '.docs.tsx'

/**
 * Every docs page: each `*.docs.tsx` under core-v2's `src/`, placed by its
 * file location and `<Page nav>`.
 */
export const listDocsEntries = cache(
  async (): Promise<DocsEntry[]> =>
    Promise.all(
      (await findDocsModules()).map(async (module) => {
        const model = await loadDocsModule(module)
        return { ...resolveDocLocation(module, model), module }
      })
    )
)

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

function srcDir() {
  return path.resolve(process.cwd(), '../packages/core-v2/src')
}
