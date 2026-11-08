import { defaultValues } from './article-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getArticlePlaygroundShowcase } from './get-showcase'
import { codeToHtml } from 'shiki/bundle/web'
import { ArticlePlaygroundClient } from './article-playground-client'

export default async function ArticlePlayground() {
  const initialHtml = await codeToHtml(
    renderToMarkup(getArticlePlaygroundShowcase(defaultValues)),
    {
      lang: 'html',
      theme: 'github-dark',
      structure: 'inline',
    }
  )

  return <ArticlePlaygroundClient initialHtml={initialHtml} />
}
