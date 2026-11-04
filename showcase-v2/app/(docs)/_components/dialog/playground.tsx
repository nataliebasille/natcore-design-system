import { highlightPlaygroundMarkup } from '@/app/_ui/playground/highlight-playground-markup'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getDialogPlaygroundShowcase } from './get-showcase'
import { defaultValues } from './dialog-playground-controls'
import { DialogPlaygroundClient } from './dialog-playground-client'

export default async function DialogPlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getDialogPlaygroundShowcase(defaultValues))
  )

  return <DialogPlaygroundClient initialHtml={initialHtml} />
}
