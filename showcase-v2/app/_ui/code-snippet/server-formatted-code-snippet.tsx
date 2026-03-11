import { formatCode, type SupportedLanguages } from '@/utlls/format-code'
import { codeToHtml } from 'shiki/bundle/full'
import { CodeSnippet } from './code-snippet'

export type ServerFormattedCodeSnippetProps = {
  className?: string
  code: string
  language: SupportedLanguages
}

export async function ServerFormattedCodeSnippet({
  className,
  code,
  language,
}: ServerFormattedCodeSnippetProps) {
  const formatted = await formatCode(code, language)
  const html = await codeToHtml(formatted, {
    lang: language,
    theme: 'github-dark',
    structure: 'inline',
  })

  return <CodeSnippet className={className} code={html} language={language} />
}
