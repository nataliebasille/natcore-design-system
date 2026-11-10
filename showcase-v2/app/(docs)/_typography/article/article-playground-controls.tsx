import { PlaygroundFormElement } from '@/app/_ui/playground/playground-form-element'

export type ArticleControlValues = {
  element: 'article' | 'class'
  title: string
}

export const defaultValues: ArticleControlValues = {
  element: 'article',
  title: 'Getting started',
}

export function ArticlePlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<ArticleControlValues>
        name="element"
        label="Markup"
        input={
          <select>
            <option value="article">&lt;article&gt; element</option>
            <option value="class">article class on a &lt;div&gt;</option>
          </select>
        }
      />

      <PlaygroundFormElement<ArticleControlValues>
        name="title"
        label="Title"
        input={<input type="text" placeholder="Getting started" />}
      />
    </div>
  )
}
