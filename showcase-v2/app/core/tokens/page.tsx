import { ServerFormattedCodeSnippet } from "@/ui/code-snippet/server-formatted-code-snippet";
import { DocPager } from "@/ui/doc/doc-pager";
import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { ArrowRightIcon } from "@/ui/icons";
import {
  PALETTE,
  SHADES,
  type Palette,
  type Shade,
} from "@nataliebasille/css-engine";
import Link from "next/link";
import { type ReactNode } from "react";

const paletteDescriptions: Record<Palette, string> = {
  primary: "Primary actions, selected states, and the main brand direction.",
  secondary: "Supporting actions and secondary moments that still need color.",
  accent: "Highlights, emphasis, and moments that should stand apart.",
  surface: "Page backgrounds, containers, borders, and neutral text.",
  success: "Positive outcomes, confirmations, and valid states.",
  danger: "Destructive actions, errors, and blocking states.",
  disabled: "Unavailable controls, subdued text, and inactive surfaces.",
};

const tokenExample = `<button class="btn-solid/primary btn-size-md">
  Save changes
</button>

<div class="card card-soft/surface">
  <p class="text-surface-950/70">Tokens stay readable in markup.</p>
</div>`;

const themeExample = `:root[data-theme="citrine-reef"] {
  --theme-primary: #087f8c;
  --theme-secondary: #f59e0b;
  --theme-accent: #ef476f;
  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;
}`;

const BUILTIN_COLOR_NAMES =
  "slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose";

// Literal class strings so Tailwind detects and generates them.
const BUILTIN_PALETTE_DEMO = [
  "palette-red",
  "palette-orange",
  "palette-amber",
  "palette-lime",
  "palette-emerald",
  "palette-teal",
  "palette-sky",
  "palette-blue",
  "palette-indigo",
  "palette-violet",
  "palette-fuchsia",
  "palette-rose",
] as const;

const currentPaletteExample = `<!-- Set the palette once; children use shade-only utilities -->
<div class="palette-indigo">
  <button class="bg-500 text-on-500">Solid</button>
  <div class="bg-100 text-on-100">Soft fill</div>
  <p class="text-700">Body copy in the active palette</p>
  <div class="bg-linear-to-r from-500 via-700 to-900">Gradient</div>
</div>

<!-- Same markup, a different palette -->
<div class="palette-rose">...</div>`;

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
              {(["primary", "surface", "danger"] as const).map((palette) => (
                <ShadeRow key={palette} palette={palette} />
              ))}
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Composing with a palette"
        description="Any palette — a design-system role like palette-primary or a built-in color like palette-rose — sets the active palette on a container. Children use shade-only utilities that resolve against the nearest palette ancestor, so the same markup adapts to whatever palette is active."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <CurrentPaletteCard
            paletteClass="palette-primary"
            label="palette-primary"
          />
          <CurrentPaletteCard
            paletteClass="palette-secondary"
            label="palette-secondary"
          />
        </div>

        <div className="card card-soft/surface">
          <div data-slot="content" className="gap-3">
            <div>
              <div className="text-sm font-semibold">Shade-only utilities</div>
              <p className="text-xs/6 text-surface-950/65">
                Inside a palette, color utilities drop the color name and take
                just a shade, reading the active palette's background tone. The
                on- variants read the matching contrast foreground, and gradient
                stops work the same way.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <InlineCode>bg-{"{shade}"}</InlineCode>
              <InlineCode>text-{"{shade}"}</InlineCode>
              <InlineCode>border-{"{shade}"}</InlineCode>
              <InlineCode>text-on-{"{shade}"}</InlineCode>
              <InlineCode>from-{"{shade}"}</InlineCode>
              <InlineCode>via-{"{shade}"}</InlineCode>
              <InlineCode>to-{"{shade}"}</InlineCode>
            </div>
          </div>
        </div>

        <ServerFormattedCodeSnippet
          code={currentPaletteExample}
          language="html"
        />
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
                A class like <InlineCode>btn-solid/primary</InlineCode> says
                what the element is doing. Theme values can move underneath it
                without changing the markup.
              </p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Theme anchors"
        description="Any palette role can anchor any shade from 50 to 950. If only a role color is provided, Natcore treats it as the 500 anchor and derives 50 and 950; unanchored shades are interpolated."
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

      <DocSection
        title="Built-in color palettes"
        description="Every built-in Tailwind color is available as a palette-{color} class out of the box. Like design-system roles, built-in palettes flip in dark mode (50 <-> 950), auto-contrast their text, and expose a per-shade --theme-{color}-{shade} override."
      >
        <BuiltinPaletteGrid />

        <div className="card card-soft/surface">
          <div data-slot="content" className="gap-3">
            <div>
              <div className="text-sm font-semibold">Supported colors</div>
              <p className="text-xs/6 text-surface-950/65">
                Every built-in Tailwind color is available as a palette class.
              </p>
            </div>

            <p className="text-xs/6 text-surface-950/70">
              {BUILTIN_COLOR_NAMES}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-surface-950/55">
              <span>Use as</span>
              <InlineCode>palette-{"{color}"}</InlineCode>
              <span>— for example</span>
              <InlineCode>palette-emerald</InlineCode>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection title="Next steps">
        <div className="grid gap-3 tablet:grid-cols-3">
          <Link
            href="/core/theming"
            className="card card-hover card-soft/surface"
          >
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

          <Link
            href="/installation"
            className="card card-hover card-soft/surface"
          >
            <div data-slot="content" className="gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                Installation
              </div>
              <p className="text-xs/6 text-surface-950/65">
                Import the stylesheet and make the token classes available to
                your app.
              </p>
            </div>
          </Link>

          <Link
            href="/components/button"
            className="card card-hover card-soft/surface"
          >
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
        previous={{ href: "/installation", label: "Installation" }}
        next={{ href: "/core/theming", label: "Theming" }}
      />
    </DocPage>
  );
}

function TokenModelCard({
  label,
  title,
  description,
}: {
  label: ReactNode;
  title: ReactNode;
  description: ReactNode;
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
  );
}

function PalettePanel({ palette }: { palette: Palette }) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold capitalize">{palette}</div>
            <p className="text-xs/6 text-surface-950/65">
              {paletteDescriptions[palette]}
            </p>
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
  );
}

function BuiltinPaletteGrid() {
  return (
    <div className="grid gap-1.5">
      {BUILTIN_PALETTE_DEMO.map((paletteClass) => (
        <div
          key={paletteClass}
          className={`${paletteClass} grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3`}
        >
          <span className="text-xs font-medium capitalize">
            {paletteClass.replace("palette-", "")}
          </span>
          <div className="grid grid-cols-11 overflow-hidden rounded-md border border-surface-600/20">
            {SHADES.map((shade) => (
              <span
                key={shade}
                className="flex h-7 items-center justify-center text-[9px] font-medium"
                style={{
                  backgroundColor: `var(--bg-tone-${shade})`,
                  color: `var(--fg-tone-${shade})`,
                }}
              >
                {shade}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CurrentPaletteCard({
  paletteClass,
  label,
}: {
  paletteClass: string;
  label: string;
}) {
  return (
    <div
      className={`${paletteClass} grid gap-2 rounded-lg border border-surface-600/20 p-4`}
    >
      <div className="text-xs font-medium text-surface-950/55">{label}</div>
      <div className="bg-500 rounded-md px-3 py-2 text-sm font-medium text-on-500">
        bg-500 · text-on-500
      </div>
      <div className="bg-100 rounded-md px-3 py-2 text-sm font-medium text-on-100">
        bg-100 · text-on-100
      </div>
      <div className="rounded-md border px-3 py-2 text-sm font-medium border-500 text-700">
        border-500 · text-700
      </div>
      <div className="rounded-md bg-linear-to-r from-500 via-700 to-900 px-3 py-2 text-sm font-medium text-on-700">
        from-500 · via-700 · to-900
      </div>
    </div>
  );
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
  );
}

function InfoPanel({
  title,
  description,
  swatch,
}: {
  title: ReactNode;
  description: ReactNode;
  swatch: string;
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
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block">
      <code className="code-soft/surface code text-xs">{children}</code>
    </span>
  );
}

function colorToken(palette: Palette, shade: Shade) {
  return `var(--color-${palette}-${shade})`;
}

function onColorToken(palette: Palette, shade: Shade) {
  return `var(--color-on-${palette}-${shade})`;
}
