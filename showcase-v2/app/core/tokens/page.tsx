import { ServerFormattedCodeSnippet } from '@/ui/code-snippet/server-formatted-code-snippet'
import { DocPager } from '@/ui/doc/doc-pager'
import { DocPage } from '@/ui/doc/DocPage'
import { DocSection } from '@/ui/doc/DocPage.client'
import { ArrowRightIcon } from '@/ui/icons'
import { PALETTE, SHADES, type Palette, type Shade } from '@nataliebasille/css-engine'
import Link from 'next/link'
import { type ReactNode } from 'react'

const paletteDescriptions: Record<Palette, string> = {
  primary: 'Primary actions, selected states, and the main brand direction.',
  secondary: 'Supporting actions and secondary moments that still need color.',
  accent: 'Highlights, emphasis, and moments that should stand apart.',
  surface: 'Page backgrounds, containers, borders, and neutral text.',
  success: 'Positive outcomes, confirmations, and valid states.',
  danger: 'Destructive actions, errors, and blocking states.',
  disabled: 'Unavailable controls, subdued text, and inactive surfaces.',
}

const tokenExample = `<button class="btn-solid/primary btn-size-md">
  Save changes
</button>

<div class="card card-soft/surface">
  <p class="text-surface-950/70">Tokens stay readable in markup.</p>
</div>`

const themeExample = `:root[data-theme="citrine-reef"] {
  --theme-primary: #087f8c;
  --theme-secondary: #f59e0b;
  --theme-accent: #ef476f;
  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;
}`

export default function CoreTokensPage() {
  return (
    <DocPage
      title="Core Tokens"
      description="The shared color roles, shade scale, and naming rules behind Natcore components and utilities."
    >
      <DocSection
        title="Token model"
        description="Natcore tokens start with semantic palette roles, then expand into adaptive shade scales that work across light and dark themes."
      >
        <div className="grid gap-3 tablet:grid-cols-3">
          <TokenModelCard
            label="01"
            title="Role"
            description="Choose a palette by intent: primary, surface, danger, success, and the rest of the core roles."
          />
          <TokenModelCard
            label="02"
            title="Shade"
            description="Use the shade scale for hierarchy: lower numbers are softer, higher numbers carry stronger contrast."
          />
          <TokenModelCard
            label="03"
            title="Tone"
            description="Pair background and foreground tokens so text follows the active palette and theme."
          />
        </div>
      </DocSection>

      <DocSection
        title="Palette roles"
        description="These roles are the stable API. Themes can change the color values while markup keeps the same intent."
      >
        <div className="grid gap-3 tablet:grid-cols-2">
          {PALETTE.map((palette) => (
            <PalettePanel key={palette} palette={palette} />
          ))}
        </div>
      </DocSection>

      <DocSection
        title="Shade scale"
        description="Each palette exposes the same shade steps, which keeps component variants predictable across roles."
      >
        <div className="card overflow-hidden card-soft/surface">
          <div data-slot="content" className="gap-4">
            <div className="grid gap-3">
              {(['primary', 'surface', 'danger'] as const).map((palette) => (
                <ShadeRow key={palette} palette={palette} />
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Using tokens"
        description="Use component modifiers when you can, and utility classes when you need to compose custom structure."
      >
        <div className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_18rem]">
          <ServerFormattedCodeSnippet code={tokenExample} language="html" />

          <div className="card self-start card-soft/surface">
            <div data-slot="content" className="gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                Read from intent
              </div>
              <p className="text-xs/6 text-surface-950/65">
                A class like <InlineCode>btn-solid/primary</InlineCode> says what the element is
                doing. Theme values can move underneath it without changing the markup.
              </p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Theme anchors"
        description="Any palette role can define 50, 500, and 950 anchors. If only a role color is provided, Natcore treats it as the 500 anchor and derives 50 and 950."
      >
        <div className="grid gap-4">
          <ServerFormattedCodeSnippet code={themeExample} language="css" />

          <div className="grid gap-3 tablet:grid-cols-3">
            <InfoPanel
              title="50"
              description="Soft surface and low-emphasis fills."
              swatch="var(--color-primary-50)"
            />
            <InfoPanel
              title="500"
              description="The theme's central role color."
              swatch="var(--color-primary-500)"
            />
            <InfoPanel
              title="950"
              description="Strong contrast for text and deep surfaces."
              swatch="var(--color-primary-950)"
            />
          </div>
        </div>
      </DocSection>

      <DocSection title="Next steps">
        <div className="grid gap-3 tablet:grid-cols-3">
          <Link href="/core/theming" className="card card-hover card-soft/surface">
            <div data-slot="content" className="gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                Theming
              </div>
              <p className="text-xs/6 text-surface-950/65">
                See how token anchors resolve across light and dark schemes.
              </p>
            </div>
          </Link>

          <Link href="/installation" className="card card-hover card-soft/surface">
            <div data-slot="content" className="gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                Installation
              </div>
              <p className="text-xs/6 text-surface-950/65">
                Import the stylesheet and make the token classes available to your app.
              </p>
            </div>
          </Link>

          <Link href="/components/button" className="card card-hover card-soft/surface">
            <div data-slot="content" className="gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                Components
              </div>
              <p className="text-xs/6 text-surface-950/65">
                See how component classes consume palette and tone tokens.
              </p>
            </div>
          </Link>
        </div>
      </DocSection>

      <DocPager
        previous={{ href: '/installation', label: 'Installation' }}
        next={{ href: '/core/theming', label: 'Theming' }}
      />
    </DocPage>
  )
}

function TokenModelCard({
  label,
  title,
  description,
}: {
  label: ReactNode
  title: ReactNode
  description: ReactNode
}) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-surface-50 text-xs text-on-surface-50">
            {label}
          </span>
          {title}
        </div>
        <p className="text-xs/6 text-surface-950/65">{description}</p>
      </div>
    </div>
  )
}

function PalettePanel({ palette }: { palette: Palette }) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold capitalize">{palette}</div>
            <p className="text-xs/6 text-surface-950/65">{paletteDescriptions[palette]}</p>
          </div>

          <div className="flex overflow-hidden rounded-md border border-surface-600/20">
            {([50, 500, 950] as const).map((shade) => (
              <span
                key={shade}
                className="block size-8"
                style={{ backgroundColor: colorToken(palette, shade) }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <InlineCode>bg-{palette}-500</InlineCode>
          <InlineCode>text-on-{palette}-500</InlineCode>
          <InlineCode>palette-{palette}</InlineCode>
        </div>
      </div>
    </div>
  )
}

function ShadeRow({ palette }: { palette: Palette }) {
  return (
    <div className="grid gap-2 tablet:grid-cols-[5rem_minmax(0,1fr)] tablet:items-center">
      <div className="text-xs font-medium tracking-wider text-surface-950/55 uppercase">
        {palette}
      </div>
      <div className="grid grid-cols-11 overflow-hidden rounded-md border border-surface-600/20">
        {SHADES.map((shade) => (
          <div
            key={shade}
            className="flex min-h-14 items-end justify-center p-1 text-[0.625rem] font-medium"
            style={{
              backgroundColor: colorToken(palette, shade),
              color: onColorToken(palette, shade),
            }}
          >
            {shade}
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoPanel({
  title,
  description,
  swatch,
}: {
  title: ReactNode
  description: ReactNode
  swatch: string
}) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-2">
        <span
          className="block h-2 rounded-full"
          style={{
            backgroundColor: swatch,
          }}
        />
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-xs/6 text-surface-950/65">{description}</p>
      </div>
    </div>
  )
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="code-soft/surface code text-xs">{children}</code>
}

function colorToken(palette: Palette, shade: Shade) {
  return `var(--color-${palette}-${shade})`
}

function onColorToken(palette: Palette, shade: Shade) {
  return `var(--color-on-${palette}-${shade})`
}
