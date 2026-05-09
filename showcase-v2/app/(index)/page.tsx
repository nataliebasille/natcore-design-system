import { ArrowRightIcon } from '@/ui/icons'
import { ComponentsIcon } from '@/ui/icons/components'
import { GuidelinesIcon } from '@/ui/icons/guidelines'
import { TokenIcon } from '@/ui/icons/token'
import { Overline } from '@/ui/layout/overline'
import { PALETTE } from '@nataliebasille/css-engine'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const BG_COLORS: Record<(typeof PALETTE)[number], string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  accent: 'bg-accent-500',
  surface: 'bg-surface-500',
  success: 'bg-success-500',
  danger: 'bg-danger-500',
  disabled: 'bg-disabled-500',
}

export default function Home() {
  return (
    <article className="p-4 desktop:p-6">
      <section className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <Overline className="mb-3">Introduction</Overline>
          <h1>
            <span>Natcore</span>
            <br />
            <span className="text-(--tone-current-fg)/70">Design System</span>
          </h1>

          <p className="max-w-2xl text-xl tracking-tight text-surface-950/60">
            A CSS-first design system built to survive different stacks. Tokens, utilities, and
            component styles are applied through class names. If your product renders HTML, Natcore
            can style it.
          </p>
        </div>

        <div className="card self-start card-outline/surface">
          <div data-slot="content" className="gap-4">
            <div>
              <Overline className="mb-2">Start here</Overline>
              <p className="text-sm/7 text-surface-950/65">
                Install the package, import one stylesheet, then compose UI with the same class
                language this documentation uses.
              </p>
            </div>
            <Link
              href="/installation"
              className="flex w-fit btn-outline items-center gap-2 btn-size-sm"
            >
              Installation guide <ArrowRightIcon className="size-3" />
            </Link>
          </div>
        </div>
      </section>

      <div className="my-8 divider" />

      <section className="flex flex-col">
        <Overline>Principles</Overline>

        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 tablet:gap-4 desktop:grid-cols-4">
          <InfoCard
            icon={<span className="inline-block aspect-square text-xs">01</span>}
            title="Stack agnostic"
            description="The core is CSS. If your product renders HTML, Natcore can style it."
          />

          <InfoCard
            icon={<span className="inline-block aspect-square text-xs">02</span>}
            title="Composable"
            description="Build UI by composing utilities and tokens, not one-off custom CSS."
          />
          <InfoCard
            icon={<span className="inline-block aspect-square text-xs">03</span>}
            title="Consistent"
            description="Modifiers express intent. Scan markup and understand it without reading implementation."
          />
          <InfoCard
            icon={<span className="inline-block aspect-square text-xs">04</span>}
            title="Themeable"
            description="Same HTML renders under any theme. Switch with a single data attribute."
          />
        </div>
      </section>

      <div className="my-8 divider" />

      <section className="flex flex-col">
        <Overline>Explore</Overline>

        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 tablet:gap-4 desktop:grid-cols-3">
          <InfoCard
            icon={<TokenIcon className="h-4 w-4" />}
            title="Tokens"
            description="Color, spacing, typography, radii, shadow, and motion as CSS variables"
          />
          <InfoCard
            icon={<ComponentsIcon className="h-4 w-4" />}
            title="Components"
            description="Everything you need to build consistent interfaces"
            href="/components/button"
          />
          <InfoCard
            icon={<GuidelinesIcon className="h-4 w-4" />}
            title="Guidelines"
            description="Variants, tones, naming conventions, and theming rules"
          />
        </div>
      </section>

      <div className="my-8 divider" />

      <section>
        <Overline>Core Tokens</Overline>

        <div className="flex flex-wrap gap-3">
          {PALETTE.map((color) => (
            <div
              key={color}
              className="badge-soft/surface flex items-center rounded-lg px-3 py-1.5"
            >
              <span
                className={twMerge(BG_COLORS[color], 'mr-2 inline-block h-3 w-3 rounded-sm')}
              ></span>
              {color}
            </div>
          ))}
        </div>
      </section>

      <div className="my-8 divider" />

      <div className="flex justify-end">
        <Link href="/installation" className="flex btn-outline items-center gap-2 btn-size-sm">
          Installation guide <ArrowRightIcon className="size-3" />
        </Link>
      </div>
    </article>
  )
}

function InfoCard({
  icon,
  title,
  description,
  href,
}: {
  icon: ReactNode
  title: string
  description: string
  href?: string
}) {
  const content = (
    <div data-slot="content" className="flex flex-col gap-1 tablet:gap-2">
      <span className="flex items-center gap-2">
        <span className="inline-flex aspect-square size-7 items-center justify-center rounded-md bg-surface-50 text-on-surface-50">
          {icon}
        </span>
        {title}
      </span>
      <span className="flex-1 text-xs/relaxed text-(--tone-current-fg)/70">{description}</span>

      {href && (
        <span className="mt-4 flex items-center-safe gap-1 text-xs tracking-wider uppercase">
          Explore <ArrowRightIcon className="size-3" />
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="card card-hover card-soft/surface">
        {content}
      </Link>
    )
  }

  return <div className="card card-soft/surface">{content}</div>
}
