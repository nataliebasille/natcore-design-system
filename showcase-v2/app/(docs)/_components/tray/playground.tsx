import { highlightPlaygroundMarkup } from '@/app/_ui/playground/highlight-playground-markup'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getTrayPlaygroundShowcase } from './get-showcase'
import { defaultValues } from './tray-playground-controls'
import { TrayPlaygroundClient } from './tray-playground-client'

export default async function TrayPlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getTrayPlaygroundShowcase(defaultValues))
  )

  return <TrayPlaygroundClient initialHtml={initialHtml} />
}
