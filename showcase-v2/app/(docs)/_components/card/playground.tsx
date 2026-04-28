import { defaultValues } from './card-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getCardPlaygroundShowcase } from './get-showcase'
import { CardPlaygroundClient } from './card-playground-client'
import { highlightPlaygroundMarkup } from '@/app/_ui/playground/highlight-playground-markup'

export default async function CardPlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getCardPlaygroundShowcase(defaultValues))
  )

  return <CardPlaygroundClient initialHtml={initialHtml} />
}
