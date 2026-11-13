'use client'

import { Playground } from '@/app/_ui/playground/playground'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getPopoverPlaygroundShowcase } from './get-showcase'
import {
  defaultValues,
  PopoverPlaygroundControls,
  type PopoverControlValues,
} from './popover-playground-controls'
import { PopoverPlaygroundShowcaseUI } from './popover-playground-showcase-ui'

export function PopoverPlaygroundClient({ initialHtml }: { initialHtml: string }) {
  return (
    <Playground<PopoverControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<PopoverPlaygroundControls />}
      ui={<PopoverPlaygroundShowcaseUI />}
      renderMarkup={(values) => renderToMarkup(getPopoverPlaygroundShowcase(values))}
    />
  )
}
