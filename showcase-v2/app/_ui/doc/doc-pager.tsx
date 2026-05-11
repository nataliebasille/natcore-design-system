import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'

type PagerLink = {
  href: string
  label: string
}

export function DocPager({ previous, next }: { previous?: PagerLink; next?: PagerLink }) {
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-surface-600/20 pt-4">
      <div>
        {previous && (
          <Link href={previous.href} className="flex btn-outline items-center gap-2 btn-size-sm">
            <ArrowLeftIcon className="size-3" />
            {previous.label}
          </Link>
        )}
      </div>

      <div className="ml-auto">
        {next && (
          <Link href={next.href} className="flex btn-outline items-center gap-2 btn-size-sm">
            {next.label}
            <ArrowRightIcon className="size-3" />
          </Link>
        )}
      </div>
    </nav>
  )
}
