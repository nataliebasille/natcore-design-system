'use client'

import { Playground } from '@/app/_ui/playground/playground'
import {
  ArticlePlaygroundControls,
  defaultValues,
  type ArticleControlValues,
} from './article-playground-controls'
import { renderToMarkup } from '@nataliebasille/preview-jsx-runtime'
import { getArticlePlaygroundShowcase } from './get-showcase'
import { ArticlePlaygroundShowcaseUI } from './article-playground-showcase-ui'

export function ArticlePlaygroundClient({ initialHtml }: { initialHtml: string }) {
  return (
    <Playground<ArticleControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<ArticlePlaygroundControls />}
      ui={<ArticlePlaygroundShowcaseUI />}
      renderMarkup={(values) => renderToMarkup(getArticlePlaygroundShowcase(values))}
    />
  )
}
