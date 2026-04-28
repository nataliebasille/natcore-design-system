import { highlightPlaygroundMarkup } from '@/app/_ui/playground/highlight-playground-markup'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getListPlaygroundShowcase } from './get-showcase'
import { defaultValues } from './list-playground-controls'
import { ListPlaygroundClient } from './list-playground-client'

export default async function ListPlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getListPlaygroundShowcase(defaultValues))
  )

  return <ListPlaygroundClient initialHtml={initialHtml} />
}
