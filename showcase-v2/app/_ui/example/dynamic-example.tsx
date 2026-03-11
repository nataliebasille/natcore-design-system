import { CodeSnippet } from '../code-snippet/code-snippet'
import { ExampleContainer } from './example-container'

export type DynamicExampleProps = {
  className?: string
  html: string
}

export function DynamicExample({ className, html }: DynamicExampleProps) {
  return (
    <ExampleContainer
      className={className}
      preview={<div dangerouslySetInnerHTML={{ __html: html }} />}
      code={<CodeSnippet code={html} language="html" />}
    />
  )
}
