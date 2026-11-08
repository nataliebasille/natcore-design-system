import { defaultValues } from './heading-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getHeadingPlaygroundShowcase } from './get-showcase'
import { codeToHtml } from 'shiki/bundle/web'
import { HeadingPlaygroundClient } from './heading-playground-client'

export default async function HeadingPlayground() {
  const initialHtml = await codeToHtml(
    renderToMarkup(getHeadingPlaygroundShowcase(defaultValues)),
    {
      lang: 'html',
      theme: 'github-dark',
      structure: 'inline',
    }
  )

  return <HeadingPlaygroundClient initialHtml={initialHtml} />
}
