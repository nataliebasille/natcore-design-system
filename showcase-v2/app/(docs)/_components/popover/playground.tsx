import { highlightPlaygroundMarkup } from '@/app/_ui/playground/highlight-playground-markup'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getPopoverPlaygroundShowcase } from './get-showcase'
import { defaultValues } from './popover-playground-controls'
import { PopoverPlaygroundClient } from './popover-playground-client'

export default async function PopoverPlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getPopoverPlaygroundShowcase(defaultValues))
  )

  return <PopoverPlaygroundClient initialHtml={initialHtml} />
}
