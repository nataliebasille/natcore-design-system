import type { DocPlaygroundBlock } from '@nataliebasille/css-engine'
import { playgroundDefaults } from '@nataliebasille/css-engine'
import { renderToMarkup, renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { DocsPlaygroundClient } from './docs-playground.client'
import { highlightPlaygroundMarkup } from './highlight-playground-markup'

/**
 * A docs page's `<Playground>`. The server renders the default values; the
 * client imports the same docs module to re-run `render` as controls change.
 */
export async function DocsPlayground({
  block,
  docsModulePath,
}: {
  block: DocPlaygroundBlock
  /** Path of the docs module under core-v2's `src/`, without `.docs.tsx`. */
  docsModulePath: string
}) {
  const defaultValues = playgroundDefaults(block.controls)
  const initial = block.render(defaultValues)
  const initialMarkup = renderToMarkup(initial)

  return (
    <DocsPlaygroundClient
      docsModulePath={docsModulePath}
      controls={block.controls}
      defaultValues={defaultValues}
      initialPreview={renderToUi(initial)}
      initialMarkup={initialMarkup}
      initialHtml={await highlightPlaygroundMarkup(initialMarkup)}
    />
  )
}
