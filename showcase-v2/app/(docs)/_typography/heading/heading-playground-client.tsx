'use client'

import { Playground } from '@/app/_ui/playground/playground'
import {
  HeadingPlaygroundControls,
  defaultValues,
  type HeadingControlValues,
} from './heading-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getHeadingPlaygroundShowcase } from './get-showcase'
import { HeadingPlaygroundShowcaseUI } from './heading-playground-showcase-ui'

export function HeadingPlaygroundClient({ initialHtml }: { initialHtml: string }) {
  return (
    <Playground<HeadingControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<HeadingPlaygroundControls />}
      ui={<HeadingPlaygroundShowcaseUI />}
      renderMarkup={(values) => renderToMarkup(getHeadingPlaygroundShowcase(values))}
    />
  )
}
