import { defaultValues } from './badge-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getBadgePlaygroundShowcase } from './get-showcase'
import { BadgePlaygroundClient } from './badge-playground-client'
import { highlightPlaygroundMarkup } from '@/app/_ui/playground/highlight-playground-markup'

export default async function BadgePlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getBadgePlaygroundShowcase(defaultValues))
  )

  return <BadgePlaygroundClient initialHtml={initialHtml} />
}
