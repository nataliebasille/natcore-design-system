'use client'

import { Playground } from '@/app/_ui/playground/playground'
import {
  defaultValues,
  ListPlaygroundControls,
  type ListControlValues,
} from './list-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getListPlaygroundShowcase } from './get-showcase'
import { ListPlaygroundShowcaseUI } from './list-playground-showcase-ui'

export function ListPlaygroundClient({ initialHtml }: { initialHtml: string }) {
  return (
    <Playground<ListControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<ListPlaygroundControls />}
      ui={<ListPlaygroundShowcaseUI />}
      renderMarkup={(values) => renderToMarkup(getListPlaygroundShowcase(values))}
    />
  )
}
