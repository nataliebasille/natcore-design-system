import { type SupportedLanguages } from '@/utlls/format-code'
import { type PropsWithChildren } from 'react'
import { ClipboardIcon } from '../icons/copy'
import { twMerge } from 'tailwind-merge'

export type CodeSnippetProps = PropsWithChildren<{
  className?: string
  code: string
  language: SupportedLanguages
}>

export function CodeSnippet({ className, code, language }: CodeSnippetProps) {
  return (
    <div
      className={twMerge(
        'border-tone-300-secondary flex w-full flex-col overflow-hidden rounded-md border',
        className
      )}
    >
      <span className="text-tone-500-accent bg-tone-100-secondary flex items-center rounded-t-md px-4 py-2 font-sans text-[0.625rem] font-bold uppercase tracking-widest">
        {language} <ClipboardIcon className="ml-auto h-4" />
      </span>
      <pre className="relative overflow-x-auto text-sm">
        <code
          className="bg-dark-950-secondary rounded-none"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      </pre>
    </div>
  )
}
