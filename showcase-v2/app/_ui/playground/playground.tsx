import type { ReactNode } from 'react'
import { CodeSnippet } from '../code-snippet/code-snippet'
import { ExampleContainer } from '../example/example-container'
import { PlaygroundPreview } from './playground-preview'
import { PlaygroundProvider, usePlayground } from './playground-provider'
import { PlaygroundCodeSnippet } from './playground-code-snippet'
import { codeToHtml } from 'shiki/bundle/web'

type PlaygroundProps<T extends Record<string, React.ReactElement>> = {
  controls: ReactNode
  preview: ReactNode
  renderMarkup: (values: PlaygroundValues<T>) => string
  defaultValues: Record<keyof T, string>
}

export type PlaygroundValues<in out T extends Record<string, React.ReactElement>> = {
  [K in keyof T]: string
}

export async function Playground<const T extends Record<string, React.ReactElement>>({
  controls,
  defaultValues,
  preview,
  renderMarkup,
}: PlaygroundProps<T>) {
  const initialHtml = await codeToHtml(renderMarkup(defaultValues), {
    lang: 'html',
    theme: 'github-dark',
    structure: 'inline',
  })
  return (
    <PlaygroundProvider defaultValues={defaultValues}>
      <ExampleContainer
        preview={<PlaygroundPreview controls={controls}>{preview}</PlaygroundPreview>}
        code={<PlaygroundCodeSnippet<T> renderMarkup={renderMarkup} initialHtml={initialHtml} />}
      />
    </PlaygroundProvider>
  )
}
