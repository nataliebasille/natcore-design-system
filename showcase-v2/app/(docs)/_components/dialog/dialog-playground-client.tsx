'use client'

import { Playground } from '@/app/_ui/playground/playground'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getDialogPlaygroundShowcase } from './get-showcase'
import {
  defaultValues,
  DialogPlaygroundControls,
  type DialogControlValues,
} from './dialog-playground-controls'
import { DialogPlaygroundShowcaseUI } from './dialog-playground-showcase-ui'

export function DialogPlaygroundClient({ initialHtml }: { initialHtml: string }) {
  return (
    <Playground<DialogControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<DialogPlaygroundControls />}
      ui={<DialogPlaygroundShowcaseUI />}
      renderMarkup={(values) => renderToMarkup(getDialogPlaygroundShowcase(values))}
    />
  )
}
