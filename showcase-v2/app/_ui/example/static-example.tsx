import { type PropsWithChildren, type ReactNode } from 'react'
import { fetchFile } from '@/server/fetch-file'
import { type SupportedLanguages } from '@/utlls/format-code'
import { twMerge } from 'tailwind-merge'
import { ServerFormattedCodeSnippet } from '@/ui/code-snippet/server-formatted-code-snippet'
import { ExampleContainer } from './example-container'

export type BaseExampleProps = { className?: string }
export type ExampleLoader = Promise<{ code: string; content: ReactNode }>

type ExampleFromFileProps = BaseExampleProps & {
  path: string
  language?: SupportedLanguages
}

export const StaticExample = async ({
  loader,
  className,
  language = 'html',
}: BaseExampleProps & {
  loader: ExampleLoader
  language?: SupportedLanguages
}) => {
  const { code, content } = await loader

  return (
    <ExampleContainer
      preview={content}
      code={<ServerFormattedCodeSnippet code={code} language={language} />}
      className={className}
    />
  )
}

StaticExample.FromChildren = ({ children, className }: PropsWithChildren<BaseExampleProps>) => {
  return (
    <StaticExample
      className={className}
      loader={getHtml(children).then((code) => ({ code, content: children }))}
    />
  )
}

StaticExample.FromFile = ({ path, className, language }: ExampleFromFileProps) => {
  const resolvedLanguage = language ?? inferLanguage(path)

  return (
    <StaticExample
      className={className}
      language={resolvedLanguage}
      loader={fetchFile(path).then((rawCode) => {
        const normalizedCode = normalizePreviewHtml(rawCode)
        const previewCode = resolvePreviewDisplay(normalizedCode)
        const code = resolveCodeDisplay(normalizedCode)
        const content =
          resolvedLanguage === 'html' ? (
            <div
              className="flex flex-wrap items-center justify-center gap-4"
              dangerouslySetInnerHTML={{ __html: previewCode }}
            />
          ) : (
            <pre className="font-mono text-xs">Preview is only available for HTML files.</pre>
          )

        return { code, content }
      })}
    />
  )
}

function inferLanguage(filePath: string): SupportedLanguages {
  const ext = filePath.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'ts':
      return 'ts'
    case 'tsx':
      return 'tsx'
    case 'js':
      return 'js'
    case 'jsx':
      return 'jsx'
    case 'json':
      return 'json'
    default:
      return 'html'
  }
}

function normalizePreviewHtml(code: string) {
  return code.replace(/\bclassName=/g, 'class=')
}

function resolvePreviewDisplay(source: string) {
  return resolveConditionalDisplay(source, 'preview')
}

function resolveCodeDisplay(source: string) {
  return resolveConditionalDisplay(source, 'code')
}

function resolveConditionalDisplay(source: string, mode: 'preview' | 'code') {
  const previewMarkerPattern = /<!--\s*@example:preview\s*-->/g
  const codeMarkerPattern = /<!--\s*@example:code\s*-->/g
  const endMarkerPattern = /<!--\s*@example:end\s*-->/g
  const conditionalBlockPattern =
    /<!--\s*@example:preview\s*-->([\s\S]*?)<!--\s*@example:code\s*-->([\s\S]*?)<!--\s*@example:end\s*-->/g

  const previewCount = Array.from(source.matchAll(previewMarkerPattern)).length
  const codeCount = Array.from(source.matchAll(codeMarkerPattern)).length
  const endCount = Array.from(source.matchAll(endMarkerPattern)).length

  if (previewCount === 0 && (codeCount > 0 || endCount > 0)) {
    throw new Error(
      'Invalid example file: found @example:code/@example:end without @example:preview.'
    )
  }

  if (previewCount === 0) {
    return resolvePreviewOnlyAttributes(source, mode)
  }

  if (previewCount !== codeCount || previewCount !== endCount) {
    throw new Error(
      'Invalid example file: unmatched @example:preview/@example:code/@example:end markers.'
    )
  }

  let replacedBlocks = 0
  const resolved = source.replace(conditionalBlockPattern, (_, preview, code) => {
    replacedBlocks += 1
    return mode === 'preview' ? preview : code
  })

  if (replacedBlocks !== previewCount) {
    throw new Error(
      'Invalid example file: each @example:preview marker must include matching @example:code and @example:end markers.'
    )
  }

  return resolvePreviewOnlyAttributes(stripDirectiveComments(resolved), mode)
}

function stripDirectiveComments(source: string) {
  return source
    .replace(/<!--\s*@example:preview\s*-->/g, '')
    .replace(/<!--\s*@example:code\s*-->/g, '')
    .replace(/<!--\s*@example:end\s*-->/g, '')
}

function resolvePreviewOnlyAttributes(source: string, mode: 'preview' | 'code') {
  const previewOnlyAttributePattern =
    /(\s+)@example:preview-attr:([^\s=/>]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g

  return source.replace(
    previewOnlyAttributePattern,
    (_, leadingWhitespace: string, name: string, value?: string) => {
      if (mode === 'code') {
        return ''
      }

      return `${leadingWhitespace}${name}${value ? `=${value}` : ''}`
    }
  )
}

async function getHtml(children: ReactNode) {
  const { renderToStaticMarkup } = await import('react-dom/server')
  return renderToStaticMarkup(children)
}
