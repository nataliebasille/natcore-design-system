import { type SupportedLanguages } from '@/utlls/format-code'
import { type PropsWithChildren } from 'react'
import { ClipboardIcon } from '../icons/copy'
import { twMerge } from 'tailwind-merge'
import { Spotlight } from '../doc/spotlight'

export type CodeSnippetProps = PropsWithChildren<{
  className?: string
  code: string
  language: SupportedLanguages
}>

export function CodeSnippet({ className, code, language }: CodeSnippetProps) {
  return (
    <Spotlight
      title={
        <div className="flex gap-2">
          Code
          <span className="ml-auto text-tone-500-accent">{language}</span>
          <ClipboardIcon className="ml-2 h-4" />
        </div>
      }
      className={twMerge('bg-zinc-950', className)}
    >
      <pre className="relative max-w-full overflow-x-auto text-sm leading-6 whitespace-pre">
        <code
          className="rounded-none bg-transparent p-0"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      </pre>
    </Spotlight>
  )
}
