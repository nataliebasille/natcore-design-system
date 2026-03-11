import { twMerge } from 'tailwind-merge'
import { ServerFormattedCodeSnippet } from '../code-snippet/server-formatted-code-snippet'

export function ExampleContainer({
  className,
  preview,
  code,
}: {
  className?: string
  preview: React.ReactNode
  code: React.ReactNode
}) {
  return (
    <div
      className={twMerge(
        `card-ghost/surface border-tone-200-surface flex flex-wrap items-center overflow-hidden rounded-sm border bg-transparent`,
        className
      )}
    >
      <div className="card-content flex w-full justify-center gap-4">{preview}</div>

      <div className="w-full *:rounded-none *:border-b-0 *:border-l-0 *:border-r-0">{code}</div>
    </div>
  )
}
