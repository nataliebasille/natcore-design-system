import type { PropsWithChildren } from 'react'

export function PlaygroundPreview({
  controls,
  children,
}: PropsWithChildren<{ controls: React.ReactNode }>) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div>{controls}</div>
      <div className="-mb-4 -ml-4 -mr-4 flex flex-col border-t border-zinc-300 bg-zinc-50 bg-[repeating-linear-gradient(-45deg,transparent_0_12px,rgba(0,0,0,0.06)_12px_13px)] pt-0 dark:border-zinc-700 dark:bg-zinc-900 dark:bg-[repeating-linear-gradient(-45deg,transparent_0_12px,rgba(255,255,255,0.08)_12px_13px)]">
        <div className="text-tone-500-accent flex items-center border-zinc-300 bg-zinc-100 px-4 py-2 font-sans text-[0.625rem] font-bold uppercase tracking-widest dark:border-zinc-700 dark:bg-zinc-800">
          Preview
        </div>
        <div className="self-center p-4">{children}</div>
      </div>
    </div>
  )
}
