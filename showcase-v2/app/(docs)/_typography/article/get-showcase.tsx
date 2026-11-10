/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { ArticleControlValues } from './article-playground-controls'

export function getArticlePlaygroundShowcase(values: ArticleControlValues) {
  const content = (
    <>
      <h2>{values.title || 'Getting started'}</h2>
      <p>
        Paragraphs are spaced and use a relaxed line height. Headings get extra space above them to
        separate sections.
      </p>
      <h3>Next steps</h3>
      <p>Add Tailwind utilities to any child to override its spacing.</p>
    </>
  )

  return values.element === 'class' ? (
    <div className="article w-full">{content}</div>
  ) : (
    <article className="w-full">{content}</article>
  )
}
