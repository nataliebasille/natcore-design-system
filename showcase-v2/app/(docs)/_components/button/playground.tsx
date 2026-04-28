import { defaultValues } from './button-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getButtonPlaygroundShowcase } from './get-showcase'
import { ButtonPlaygroundClient } from './button-playground-client'
import { highlightPlaygroundMarkup } from '@/app/_ui/playground/highlight-playground-markup'

export default async function ButtonPlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getButtonPlaygroundShowcase(defaultValues))
  )

  return <ButtonPlaygroundClient initialHtml={initialHtml} />
}
