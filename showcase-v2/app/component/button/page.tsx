import { DocPage, DocSection } from "@/app/_ui/doc/DocPage";
import { InlineClass } from "@/app/_ui/InlineClass";
import { ButtonPlayground } from "./_components/button-playground";
import { highlight } from "@/utlls/syntax-highlighter";

const palettes = ["primary", "secondary", "accent", "surface"] as const;
const variants = ["solid", "outline", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;

function ServerCode({ code }: { code: string }) {
  return (
    <pre className="bg-tone-900-surface text-tone-50-surface overflow-x-auto rounded-lg p-4 text-sm">
      <code
        dangerouslySetInnerHTML={{
          __html: highlight(code, { lang: "native" }),
        }}
      />
    </pre>
  );
}

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
            Combine a variant class with a palette modifier using the{" "}
            <code className="font-mono text-sm">
              btn-{"{variant}/{palette}"}
            </code>{" "}
            syntax. Hover, active, and transition states are built in.
          </>
        }
      >
        <ServerCode
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
              Three visual variants are available:{" "}
              <InlineClass className="btn-solid/*" />,{" "}
              <InlineClass className="btn-outline/*" />, and{" "}
              <InlineClass className="btn-ghost/*" />.
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-4 rounded-lg border p-6">
            <button className="btn-solid/primary">Solid</button>
            <button className="btn-outline/primary">Outline</button>
            <button className="btn-ghost/primary">Ghost</button>
          </div>
          <ServerCode
            code={`<button class="btn-solid/primary">Solid</button>
<button class="btn-outline/primary">Outline</button>
<button class="btn-ghost/primary">Ghost</button>`}
          />
        </DocSection>

        {/* ── Palettes ── */}
        <DocSection
          title="Palettes"
          description={
            <>
              Each variant can be paired with any palette:{" "}
              {palettes.map((p, i) => (
                <span key={p}>
                  <InlineClass className={`*/${p}`} />
                  {i < palettes.length - 1 ? ", " : "."}
                </span>
              ))}
            </>
          }
        >
          <div className="flex flex-col gap-6">
            {variants.map((variant) => (
              <div key={variant}>
                <p className="text-tone-500-surface mb-2 text-sm font-semibold tracking-widest uppercase">
                  {variant}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {palettes.map((palette) => (
                    <button
                      key={palette}
                      className={`btn-${variant}/${palette}`}
                    >
                      {palette.charAt(0).toUpperCase() + palette.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ServerCode
            code={`<!-- Solid palette examples -->
<button class="btn-solid/primary">Primary</button>
<button class="btn-solid/secondary">Secondary</button>
<button class="btn-solid/accent">Accent</button>
<button class="btn-solid/surface">Surface</button>

<!-- Outline palette examples -->
<button class="btn-outline/primary">Primary</button>
<button class="btn-outline/secondary">Secondary</button>

<!-- Ghost palette examples -->
<button class="btn-ghost/primary">Primary</button>
<button class="btn-ghost/secondary">Secondary</button>`}
          />
        </DocSection>

        {/* ── Sizes ── */}
        <DocSection
          title="Sizes"
          description={
            <>
              Control padding and font size with{" "}
              <InlineClass className="btn-size-{sm|md|lg}" />. The default is{" "}
              <InlineClass className="btn-size-md" />.
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-4 rounded-lg border p-6">
            {sizes.map((size) => (
              <button
                key={size}
                className={`btn-solid/primary btn-size-${size}`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
          <ServerCode
            code={`<button class="btn-solid/primary btn-size-sm">SM</button>
<button class="btn-solid/primary btn-size-md">MD</button>
<button class="btn-solid/primary btn-size-lg">LG</button>`}
          />
        </DocSection>

        {/* ── Icon Buttons ── */}
        <DocSection
          title="Icon Buttons"
          description={
            <>
              Add <InlineClass className="btn-icon" /> to make a square,
              pill-shaped icon button. Padding is equalized automatically.
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-4 rounded-lg border p-6">
            {variants.map((variant) => (
              <button
                key={variant}
                className={`btn-${variant}/primary btn-icon`}
                aria-label={`${variant} icon button`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </button>
            ))}
          </div>
          <ServerCode
            code={`<button class="btn-solid/primary btn-icon" aria-label="info">
  <!-- icon svg -->
</button>
<button class="btn-outline/primary btn-icon" aria-label="info">
  <!-- icon svg -->
</button>
<button class="btn-ghost/primary btn-icon" aria-label="info">
  <!-- icon svg -->
</button>`}
          />
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
                <th className="pr-4 pb-2 font-semibold">Class</th>
                <th className="pr-4 pb-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                [
                  "btn-solid/{palette}",
                  "Filled button with palette background",
                ],
                [
                  "btn-outline/{palette}",
                  "Transparent button with colored border and text",
                ],
                [
                  "btn-ghost/{palette}",
                  "No border or background; subtle hover tint",
                ],
                ["btn-size-sm", "Small padding & font size"],
                ["btn-size-md", "Medium padding & font size (default)"],
                ["btn-size-lg", "Large padding & font size"],
                [
                  "btn-icon",
                  "Square equal-padding icon button with pill shape",
                ],
              ].map(([cls, desc]) => (
                <tr key={cls}>
                  <td className="py-2 pr-4">
                    <code className="text-tone-700-secondary font-mono text-xs">
                      {cls}
                    </code>
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
                  <th className="pr-4 pb-2 font-semibold">Variable</th>
                  <th className="pb-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["--btn-bg-solid", "Background for solid variant"],
                  ["--btn-fg-solid", "Foreground/text for solid variant"],
                  [
                    "--btn-hover-bg-solid",
                    "Hover background for solid variant",
                  ],
                  [
                    "--btn-bg-outline",
                    "Background for outline variant (transparent)",
                  ],
                  ["--btn-fg-outline", "Foreground/text for outline variant"],
                  [
                    "--btn-border-color-outline",
                    "Border color for outline variant",
                  ],
                  [
                    "--btn-hover-bg-outline",
                    "Hover background for outline variant",
                  ],
                  [
                    "--btn-bg-ghost",
                    "Background for ghost variant (transparent)",
                  ],
                  ["--btn-fg-ghost", "Foreground/text for ghost variant"],
                  [
                    "--btn-hover-bg-ghost",
                    "Hover background for ghost variant",
                  ],
                  [
                    "--btn-px-sm / --btn-py-sm",
                    "Inline/block padding for sm size",
                  ],
                  [
                    "--btn-px-md / --btn-py-md",
                    "Inline/block padding for md size",
                  ],
                  [
                    "--btn-px-lg / --btn-py-lg",
                    "Inline/block padding for lg size",
                  ],
                ].map(([variable, purpose]) => (
                  <tr key={variable}>
                    <td className="py-2 pr-4">
                      <code className="text-tone-700-secondary font-mono text-xs">
                        {variable}
                      </code>
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
  );
}
