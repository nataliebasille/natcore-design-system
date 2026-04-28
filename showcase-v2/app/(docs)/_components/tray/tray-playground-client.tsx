'use client'

import { Playground } from '@/app/_ui/playground/playground'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getTrayPlaygroundShowcase } from './get-showcase'
import {
  defaultValues,
  TrayPlaygroundControls,
  type TrayControlValues,
} from './tray-playground-controls'
import { TrayPlaygroundShowcaseUI } from './tray-playground-showcase-ui'

export function TrayPlaygroundClient({ initialHtml }: { initialHtml: string }) {
  return (
    <Playground<TrayControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<TrayPlaygroundControls />}
      ui={<TrayPlaygroundShowcaseUI />}
      renderMarkup={(values) => renderToMarkup(getTrayPlaygroundShowcase(values))}
    />
  )
}
