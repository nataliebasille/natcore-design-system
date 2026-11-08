'use client'

import { usePlayground } from '@/app/_ui/playground/playground-provider'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { getArticlePlaygroundShowcase } from './get-showcase'
import type { ArticleControlValues } from './article-playground-controls'

export function ArticlePlaygroundShowcaseUI() {
  const { values } = usePlayground<ArticleControlValues>()
  return <>{renderToUi(getArticlePlaygroundShowcase(values))}</>
}
