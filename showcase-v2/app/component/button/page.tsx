import { DocPage, DocSection } from '@/app/_ui/doc/DocPage'
import { InlineClass } from '@/app/_ui/inline-class'
import { ButtonPlayground } from './_components/button-playground'
import { ServerFormattedCodeSnippet } from '@/app/_ui/code-snippet/server-formatted-code-snippet'
import { StaticExample } from '@/app/_ui/example/static-example'

const palettes = ['primary', 'secondary', 'accent', 'surface'] as const

export default async function ButtonPage() {
  return (
    <DocPage
      title="Button"
      description="Composable button utilities: pick a variant, a tone, and a size. Everything else (hover, focus, active) is built in."
    >
      {/* ── Playground ── */}
      <DocSection title="Playground">
        <ButtonPlayground />
      </DocSection>

      {/* ── Usage ── */}
      <DocSection
        title="Usage"
        description={
          <>
            Combine a variant class with a palette modifier using the{' '}
            <InlineClass className="btn-{variant}/{palette}" /> syntax. Hover, active, and
            transition states are built in.
          </>
        }
      >
        <ServerFormattedCodeSnippet
          language="html"
          code={`<!-- variant / palette -->
<button class="btn-solid/primary">Solid Primary</button>
<button class="btn-outline/secondary">Outline Secondary</button>
<button class="btn-ghost/accent">Ghost Accent</button>`}
        />

        {/* ── Variants ── */}
        <DocSection
          title="Variants"
          description={
            <>
              Three visual variants are available: <InlineClass className="btn-solid/*" />,{' '}
              <InlineClass className="btn-outline/*" />, and <InlineClass className="btn-ghost/*" />
              .
            </>
          }
        >
          <StaticExample.FromFile path="component/button/_examples/variants.html" />
        </DocSection>

        {/* ── Palettes ── */}
        <DocSection
          title="Palettes"
          description={
            <>
              Each variant can be paired with any palette:{' '}
              {palettes.map((p, i) => (
                <span key={p}>
                  <InlineClass className={`*/${p}`} />
                  {i < palettes.length - 1 ? ', ' : '.'}
                </span>
              ))}
            </>
          }
        >
          <DocSection title="Solid">
            <StaticExample.FromFile path="component/button/_examples/palette-solid.html" />
          </DocSection>

          <DocSection title="Outline">
            <StaticExample.FromFile path="component/button/_examples/palette-outline.html" />
          </DocSection>

          <DocSection title="Ghost">
            <StaticExample.FromFile path="component/button/_examples/palette-ghost.html" />
          </DocSection>
        </DocSection>

        {/* ── Sizes ── */}
        <DocSection
          title="Sizes"
          description={
            <>
              Control padding and font size with <InlineClass className="btn-size-{sm|md|lg}" />.
              The default is <InlineClass className="btn-size-md" />.
            </>
          }
        >
          <StaticExample.FromFile path="component/button/_examples/sizes.html" />
        </DocSection>

        {/* ── Icon Buttons ── */}
        <DocSection
          title="Icon Buttons"
          description={
            <>
              Add <InlineClass className="btn-icon" /> to make a square, pill-shaped icon button.
              Padding is equalized automatically.
            </>
          }
        >
          <StaticExample.FromFile path="component/button/_examples/icon-buttons.html" />
        </DocSection>
      </DocSection>

      {/* ── API Reference ── */}
      <DocSection
        title="API Reference"
        description="CSS custom properties you can override to customise a button at any scope."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 pr-4 font-semibold">Class</th>
                <th className="pb-2 pr-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                ['btn-solid/{palette}', 'Filled button with palette background'],
                ['btn-outline/{palette}', 'Transparent button with colored border and text'],
                ['btn-ghost/{palette}', 'No border or background; subtle hover tint'],
                ['btn-size-sm', 'Small padding & font size'],
                ['btn-size-md', 'Medium padding & font size (default)'],
                ['btn-size-lg', 'Large padding & font size'],
                ['btn-icon', 'Square equal-padding icon button with pill shape'],
              ].map(([cls, desc]) => (
                <tr key={cls}>
                  <td className="py-2 pr-4">
                    <code className="text-tone-700-secondary font-mono text-xs">{cls}</code>
                  </td>
                  <td className="py-2 text-sm">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DocSection
          title="CSS Variables"
          description="These theme variables are injected by the core plugin and can be overridden locally."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-4 font-semibold">Variable</th>
                  <th className="pb-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ['--btn-bg-solid', 'Background for solid variant'],
                  ['--btn-fg-solid', 'Foreground/text for solid variant'],
                  ['--btn-hover-bg-solid', 'Hover background for solid variant'],
                  ['--btn-bg-outline', 'Background for outline variant (transparent)'],
                  ['--btn-fg-outline', 'Foreground/text for outline variant'],
                  ['--btn-border-color-outline', 'Border color for outline variant'],
                  ['--btn-hover-bg-outline', 'Hover background for outline variant'],
                  ['--btn-bg-ghost', 'Background for ghost variant (transparent)'],
                  ['--btn-fg-ghost', 'Foreground/text for ghost variant'],
                  ['--btn-hover-bg-ghost', 'Hover background for ghost variant'],
                  ['--btn-px-sm / --btn-py-sm', 'Inline/block padding for sm size'],
                  ['--btn-px-md / --btn-py-md', 'Inline/block padding for md size'],
                  ['--btn-px-lg / --btn-py-lg', 'Inline/block padding for lg size'],
                ].map(([variable, purpose]) => (
                  <tr key={variable}>
                    <td className="py-2 pr-4">
                      <code className="text-tone-700-secondary font-mono text-xs">{variable}</code>
                    </td>
                    <td className="py-2 text-sm">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>
      </DocSection>
    </DocPage>
  )
}
