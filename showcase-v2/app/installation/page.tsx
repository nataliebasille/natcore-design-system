import { ServerFormattedCodeSnippet } from '@/ui/code-snippet/server-formatted-code-snippet'
import { DocPager } from '@/ui/doc/doc-pager'
import { DocPage } from '@/ui/doc/DocPage'
import { DocSection } from '@/ui/doc/DocPage.client'
import { ArrowRightIcon } from '@/ui/icons'
import Link from 'next/link'
import { type ReactNode } from 'react'

const installCommands = [
  {
    label: 'pnpm',
    code: 'pnpm add @nataliebasille/natcore-design-system tailwindcss',
  },
  {
    label: 'npm',
    code: 'npm install @nataliebasille/natcore-design-system tailwindcss',
  },
  {
    label: 'yarn',
    code: 'yarn add @nataliebasille/natcore-design-system tailwindcss',
  },
] as const

const stylesheetImport = `@import "tailwindcss";
@import "@nataliebasille/natcore-design-system";`

const themeExample = `<html data-theme="citrine-reef">
  <body>
    <button class="button button-solid/primary">Create project</button>
  </body>
</html>`

const productionCheck = 'pnpm build'

const steps = [
  {
    title: 'Install package',
    description: 'Add Natcore and Tailwind to the app that owns your global stylesheet.',
    content: installCommands.map((command) => (
      <CommandBlock key={command.label} label={command.label}>
        <ServerFormattedCodeSnippet code={command.code} language="bash" />
      </CommandBlock>
    )),
  },
  {
    title: 'Import stylesheet',
    description:
      'Load Tailwind first, then Natcore. The import registers tokens, component classes, modifiers, and color palettes.',
    content: <ServerFormattedCodeSnippet code={stylesheetImport} language="css" />,
  },
  {
    title: 'Use classes',
    description:
      'Natcore is CSS-first, so the same classes work in React, server-rendered templates, or plain HTML.',
    content: <ServerFormattedCodeSnippet code={themeExample} language="html" />,
  },
  {
    title: 'Verify setup',
    description:
      'Run a production build once after the import is in place so Tailwind can emit the classes used by your app.',
    content: <ServerFormattedCodeSnippet code={productionCheck} language="bash" />,
  },
] as const

export default function InstallationPage() {
  return (
    <DocPage
      title="Installation"
      description="Install Natcore, import the stylesheet, and start using component classes in your markup."
    >
      <DocSection title="Quick start">
        <div className="grid gap-6">
          {steps.map((step, index) => (
            <StepSection
              key={step.title}
              number={index + 1}
              title={step.title}
              description={step.description}
            >
              {step.content}
            </StepSection>
          ))}
        </div>
      </DocSection>

      <DocSection title="Next steps">
        <div className="grid gap-3 tablet:grid-cols-3">
          <InfoPanel
            title="Components"
            description="Start with button, card, badge, divider, list, toggle, and tray."
            href="/components/button"
          />
          <InfoPanel
            title="Modifiers"
            description="Pair component classes with palette and state modifiers to keep markup readable."
          />
          <InfoPanel
            title="Themes"
            description="Set data-theme on the root element and the same HTML follows the new palette."
          />
        </div>
      </DocSection>

      <DocPager
        previous={{ href: '/', label: 'Introduction' }}
        next={{ href: '/core/tokens', label: 'Tokens' }}
      />
    </DocPage>
  )
}

function CommandBlock({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium tracking-wider text-surface-950/50 uppercase">
        {label}
      </div>
      {children}
    </div>
  )
}

function StepSection({
  number,
  title,
  description,
  children,
}: {
  number: number
  title: ReactNode
  description: ReactNode
  children: ReactNode
}) {
  return (
    <section className="grid gap-3 tablet:grid-cols-[2.25rem_minmax(0,1fr)] tablet:gap-4">
      <div className="max-tablet:hidden">
        <span className="flex size-9 items-center justify-center rounded-md border border-surface-600/25 bg-surface-50 text-sm font-semibold text-on-surface-50">
          {number}
        </span>
      </div>

      <div>
        <div className="mb-3 flex items-start gap-3">
          <span className="flex size-9 flex-[0_0_auto] items-center justify-center rounded-md border border-surface-600/25 bg-surface-50 text-sm font-semibold text-on-surface-50 tablet:hidden">
            {number}
          </span>
          <div>
            <h2 className="mt-0! mb-1 text-2xl tracking-tight">{title}</h2>
            <p className="text-sm/7 text-surface-950/65">{description}</p>
          </div>
        </div>

        <div className="grid gap-4">{children}</div>
      </div>
    </section>
  )
}

function InfoPanel({
  title,
  description,
  href,
}: {
  title: ReactNode
  description: ReactNode
  href?: string
}) {
  const content = (
    <div data-slot="content" className="gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {href && <ArrowRightIcon className="size-4 text-accent-500" />}
        {title}
      </div>
      <p className="text-xs/6 text-surface-950/65">{description}</p>
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
