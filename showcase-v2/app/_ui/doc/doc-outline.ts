import type { DocModel } from '@nataliebasille/css-engine'

export type OutlineHeading = { id: string; title: string }

/** Titles of the sections every docs page may add around its own. */
export const AT_A_GLANCE_TITLE = 'At a glance'
export const PLAYGROUND_TITLE = 'Playground'
export const API_REFERENCE_TITLE = 'API Reference'

/**
 * A docs page's top-level headings, in the order `DocsModelPage` renders them,
 * with the ids `DocSection` gives them.
 */
export function docOutline(model: DocModel): OutlineHeading[] {
  const titles = [
    ...(model.atAGlance !== undefined ? [AT_A_GLANCE_TITLE] : []),
    ...model.blocks.flatMap((block) =>
      block.kind === 'playground'
        ? [PLAYGROUND_TITLE]
        : block.kind === 'section'
          ? [block.title]
          : []
    ),
    ...(model.api ? [API_REFERENCE_TITLE] : []),
  ]

  return titles.map((title) => ({ id: sectionId([title]), title }))
}

/** A section heading's id, from its title and the titles of the sections around it. */
export function sectionId(titlePath: string[]) {
  return titlePath.map((title) => slugify(title) || 'section').join('--')
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}
