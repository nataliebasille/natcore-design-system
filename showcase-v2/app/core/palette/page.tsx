import { ServerFormattedCodeSnippet } from "@/ui/code-snippet/server-formatted-code-snippet";
import { DocPager } from "@/ui/doc/doc-pager";
import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { ArrowRightIcon } from "@/ui/icons";
import Link from "next/link";
import { type ReactNode } from "react";

const PALETTE_SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

const BUILTIN_PALETTES = [
  { name: "primary", paletteClass: "palette-primary" },
  { name: "secondary", paletteClass: "palette-secondary" },
  { name: "accent", paletteClass: "palette-accent" },
  { name: "surface", paletteClass: "palette-surface" },
  { name: "success", paletteClass: "palette-success" },
  { name: "danger", paletteClass: "palette-danger" },
] as const;

const BUILTIN_COLOR_NAMES =
  "slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose";

// Literal class strings so Tailwind detects and generates them.
const BUILTIN_COLOR_DEMO = [
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

const buildSteps = [
  {
    label: "01",
    title: "A theme assigns a color",
    description:
      "A theme gives each role — primary, surface, and the rest — a single color or explicit anchors.",
  },
  {
    label: "02",
    title: "Resolve anchors",
    description:
      "A lone color becomes the 500 anchor; 50 and 950 derive from it. Any shade can be anchored explicitly.",
  },
  {
    label: "03",
    title: "Derive the ramp",
    description:
      "Unanchored shades interpolate between the bracketing anchors, and a readable on-color is generated for each.",
  },
  {
    label: "04",
    title: "Mirror for dark",
    description:
      "Dark-mode tokens point to the opposite side of the light ramp, so contrast flips without new markup.",
  },
  {
    label: "05",
    title: "Expose tokens",
    description:
      "The palette surfaces adaptive tokens like color-primary-500 that utilities and components read.",
  },
] as const;

const namedUtilityExample = `<!-- Name the palette inline with any color utility -->
<button class="bg-primary-500 text-on-primary-500">Save</button>
<span class="text-secondary-700">Secondary label</span>
<div class="border border-accent-500">Accent border</div>`;

const paletteClassExample = `<!-- A design-system role as the current palette -->
<div class="palette-primary">
  <button class="bg-500 text-on-500">Solid</button>
  <div class="bg-100 text-on-100">Soft fill</div>
  <p class="text-700">Body copy in the active palette</p>
</div>

<!-- Same markup, a built-in Tailwind color -->
<div class="palette-emerald">...</div>`;

const componentModifierExample = `<!-- A /{palette} modifier accepts a role… -->
<button class="btn-solid/primary">Primary</button>
<button class="btn-soft/accent">Accent</button>

<!-- …or a built-in Tailwind color -->
<button class="btn-solid/emerald">Emerald</button>
<button class="btn-soft/sky">Sky</button>`;

const postcssConfigExample = `// postcss.config.js — the Natcore transform runs BEFORE Tailwind
module.exports = {
  plugins: {
    "@nataliebasille/natcore-design-system/postcss": {},
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};`;

const viteConfigExample = `// vite.config.ts — use the Vite variant instead
import natcorePalettes from "@nataliebasille/natcore-design-system/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // natcorePalettes() must come before tailwindcss()
  plugins: [natcorePalettes(), tailwindcss()],
});`;

const declareExample = `@import "tailwindcss";
@import "@nataliebasille/natcore-design-system";

@natcore-palettes {
  /* A single color becomes the 500 anchor; 50/950 and the
     rest of the ramp are derived — the same anchor model a
     theme uses for its roles. */
  brand: #f04e23;

  /* Or pin explicit anchors / nudge any shade 50-950. */
  info-50: #eaf6ff;
  info-500: #0099ff;
  info-950: #001a33;
}`;

const pumpkinExample = `@natcore-palettes {
  pumpkin-50: #fff5e9;
  pumpkin-100: #ffe3c4;
  pumpkin-200: #f9c489;
  pumpkin-300: #f2a04a;
  pumpkin-400: #eb7d1e;
  pumpkin-500: #dd5f10;
  pumpkin-600: #c24a0e;
  pumpkin-700: #a23a12;
  pumpkin-800: #7f2f14;
  pumpkin-900: #6a2810;
  pumpkin-950: #5a230a;
}`;

const customUsageExample = `<!-- Everything a built-in palette can do, your palette can too -->
<div class="bg-pumpkin-500 text-on-pumpkin-500">Pumpkin</div>
<button class="btn-solid/pumpkin">Carve</button>
<section class="palette-pumpkin">
  <span class="bg-500 text-on-500">Current tone = pumpkin</span>
</section>`;

const flipExample = `/* Dark is the light ramp, mirrored end-to-end */
--color-dark-primary-50:  var(--color-light-primary-950);
--color-dark-primary-100: var(--color-light-primary-900);
/* …200↔800, 300↔700, 400↔600, 500 stays… */
--color-dark-primary-950: var(--color-light-primary-50);

/* The adaptive token picks the active scheme's side */
--color-primary-500: light-dark(
  var(--color-light-primary-500),
  var(--color-dark-primary-500)
);`;

export default function CorePalettePage() {
  return (
    <DocPage
      title="Palette"
      description="A palette is a single color expanded into a full 50-950 shade ramp. Every palette comes from a theme: a theme assigns a color to each role, and Natcore builds the ramp, mirrors it for dark mode, and exposes adaptive tokens. You can also define your own palettes."
    >
      <DocSection
        title="Palettes come from themes"
        description="A theme is a whole color scheme; a palette is one color within it. The theme assigns a color (or anchors) to each role, and Natcore turns each into a full ramp through the same anchor model — so every palette, built-in or custom, works the same way."
      >
        <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-5">
          {buildSteps.map((step) => (
            <ProcessCard
              key={step.label}
              label={step.label}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </DocSection>

      <DocSection
        title="Light and dark"
        description="A palette is built once on the light side, then mirrored for dark: dark-{shade} points at the light ramp's opposite end — 50↔950, 100↔900, and so on, with 500 unchanged. A shade number keeps its semantic role but resolves to the other end of the ramp, so bg-surface-50 is a light surface in light mode and a dark surface in dark mode, with no markup change. The on-colors mirror the same way, so contrast flips automatically. Which side is active is the separate scheme axis — see Theming."
      >
        <div className="card card-soft/surface">
          <div data-slot="content" className="gap-4">
            <SchemeRamp
              name="primary"
              side="light"
              label="Light scheme"
              hint="--color-light-primary-{shade}"
            />
            <SchemeRamp
              name="primary"
              side="dark"
              label="Dark scheme"
              hint="--color-dark-primary-{shade} — the same ramp, reversed"
            />
          </div>
        </div>

        <ServerFormattedCodeSnippet code={flipExample} language="css" />
      </DocSection>

      <DocSection
        title="Built-in palettes"
        description="Natcore ships two families of ready-made palettes: the semantic theme-role palettes and every built-in Tailwind color. Both expand through the same anchor model, flip in dark mode, and auto-contrast their text."
      >
        <DocSection
          title="Theme role palettes"
          description="A theme defines six semantic roles. Markup references the role, not a hex, so the same components work across every theme — see Theming for what each role is for. Each ramp below is live, rendered from this site's active theme."
        >
          <div className="grid gap-3">
            {BUILTIN_PALETTES.map((palette) => (
              <BuiltinPalette
                key={palette.name}
                name={palette.name}
                paletteClass={palette.paletteClass}
              />
            ))}
          </div>

          <Link
            href="/core/theming"
            className="card card-hover card-soft/surface"
          >
            <div data-slot="content" className="gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                What each role means
              </div>
              <p className="text-xs/6 text-surface-950/65">
                Theming documents the intent of primary, secondary, accent,
                surface, success, danger, and disabled.
              </p>
            </div>
          </Link>
        </DocSection>

        <DocSection
          title="Tailwind color palettes"
          description="Every built-in Tailwind color is available as a palette-{color} class out of the box. Like role palettes, they flip in dark mode (50 <-> 950), auto-contrast their text, and expose a per-shade --theme-{color}-{shade} override."
        >
          <BuiltinColorGrid />

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
      </DocSection>

      <DocSection
        title="Using a palette"
        description="There are three ways to reach a palette's colors: name it inline on a utility, set it once as the current tone and use shade-only utilities, or pass it as a component modifier."
      >
        <DocSection
          title="Named color utilities"
          description="Any color utility accepts {palette}-{shade}. On-colors pair with backgrounds so text stays readable."
        >
          <ServerFormattedCodeSnippet
            code={namedUtilityExample}
            language="html"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary-500 px-3 py-1.5 text-sm text-on-primary-500">
              bg-primary-500
            </span>
            <span className="rounded-md bg-accent-500 px-3 py-1.5 text-sm text-on-accent-500">
              bg-accent-500
            </span>
            <span className="text-sm font-semibold text-secondary-700">
              text-secondary-700
            </span>
          </div>
        </DocSection>

        <DocSection
          title="The palette class & tone utilities"
          description="Set the current tone once with palette-{name}, then children use shade-only tone utilities like bg-{shade} and text-on-{shade}. Swap the palette class and the whole subtree re-tones with no other markup changes."
        >
          <ServerFormattedCodeSnippet
            code={paletteClassExample}
            language="html"
          />
          <div className="grid gap-3 tablet:grid-cols-2">
            <ToneDemo
              palette="palette-primary"
              label="palette-primary (role)"
            />
            <ToneDemo
              palette="palette-emerald"
              label="palette-emerald (built-in)"
            />
          </div>
        </DocSection>

        <DocSection
          title="Component modifiers"
          description="Components accept a /{palette} modifier, which sets the current tone for that component instance — a design-system role or a built-in Tailwind color both work."
        >
          <ServerFormattedCodeSnippet
            code={componentModifierExample}
            language="html"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-solid/primary">Primary (role)</button>
            <button className="btn-soft/accent">Accent (role)</button>
            <button className="btn-solid/emerald">Emerald (built-in)</button>
            <button className="btn-soft/sky">Sky (built-in)</button>
          </div>
        </DocSection>
      </DocSection>

      <DocSection
        title="Custom palettes"
        description="Beyond the six built-in roles, you can declare your own named palettes with the @natcore-palettes at-rule. They use the exact same anchor model, utilities, component modifiers, and per-shade tree-shaking — they are palettes in every way."
      >
        <DocSection
          title="1. Install the transform"
          description="The @natcore-palettes at-rule is expanded by a Natcore plugin that must run BEFORE Tailwind. Add the PostCSS plugin, or the Vite variant for Vite-based setups. This step is required before the at-rule will do anything."
        >
          <div className="grid gap-4 desktop:grid-cols-2">
            <CodeBlock
              title="PostCSS"
              description="Add it to postcss.config.js ahead of @tailwindcss/postcss."
              code={postcssConfigExample}
              language="js"
            />
            <CodeBlock
              title="Vite"
              description="Add it to vite.config ahead of @tailwindcss/vite."
              code={viteConfigExample}
              language="ts"
            />
          </div>
        </DocSection>

        <DocSection
          title="2. Declare palettes"
          description="With the plugin installed, declare each palette with the flat {name} / {name}-{shade} syntax. It is the same anchor model a theme uses for its roles: a single color, 50/500/950 anchors, intermediate nudges, or a fully explicit ramp. Order does not matter."
        >
          <ServerFormattedCodeSnippet code={declareExample} language="css" />

          <div className="grid gap-3 tablet:grid-cols-3">
            <GuidancePanel
              title="Single color"
              description="brand: #f04e23 becomes the 500 anchor; Natcore derives 50/950 and interpolates the rest."
            />
            <GuidancePanel
              title="Anchors & nudges"
              description="name-50, name-500, name-950 pin the outer anchors; name-300 (etc.) nudges one step."
            />
            <GuidancePanel
              title="Full ramp"
              description="Provide all eleven shades to reproduce an exact palette — like the pumpkin example below."
            />
          </div>
        </DocSection>

        <DocSection
          title="3. Example: pumpkin"
          description="A fully explicit eleven-shade ramp. Every swatch below is live — rendered from the generated light-side --color-light-pumpkin-{shade} tokens (the canonical 50→950 ramp) in this site's own theme."
        >
          <div className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ServerFormattedCodeSnippet code={pumpkinExample} language="css" />

            <div className="card card-soft/surface">
              <div data-slot="content" className="gap-3">
                <div className="text-sm font-semibold">Generated ramp</div>
                <p className="text-xs/6 text-surface-950/65">
                  <InlineCode>--color-pumpkin-50</InlineCode> through{" "}
                  <InlineCode>--color-pumpkin-950</InlineCode>, each paired with
                  a readable{" "}
                  <InlineCode>--color-on-pumpkin-{"{shade}"}</InlineCode> text
                  color.
                </p>
                <PaletteRamp name="pumpkin" />
              </div>
            </div>
          </div>
        </DocSection>

        <DocSection
          title="4. Use it like any palette"
          description="A custom palette unlocks the full token surface: native color utilities, the palette-{name} tone modifier, and component modifiers like btn-solid/pumpkin."
        >
          <ServerFormattedCodeSnippet
            code={customUsageExample}
            language="html"
          />

          <div className="card card-soft/surface">
            <div data-slot="content" className="flex flex-col gap-4">
              <div className="text-sm font-semibold">Live pumpkin</div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="btn-solid/pumpkin">Carve</button>
                <button className="btn-soft/pumpkin">Soft</button>
                <button className="btn-outline/pumpkin">Outline</button>
                <button className="btn-ghost/pumpkin">Ghost</button>
              </div>

              <div className="grid gap-3 tablet:grid-cols-2">
                <div className="card card-soft/pumpkin">
                  <div data-slot="content" className="gap-1">
                    <div className="text-sm font-semibold">
                      card-soft/pumpkin
                    </div>
                    <p className="text-xs/6">
                      Component modifiers accept the custom palette name just
                      like a built-in role.
                    </p>
                  </div>
                </div>

                <ToneDemo palette="palette-pumpkin" label="palette-pumpkin" />
              </div>
            </div>
          </div>
        </DocSection>

        <DocSection
          title="Tree-shaking"
          description="Because the transform generates custom palettes through the same pipeline as the built-ins, Tailwind prunes what you don't use."
        >
          <div className="grid gap-3 tablet:grid-cols-3">
            <GuidancePanel
              title="Per shade"
              description="Using bg-pumpkin-500 alone emits only that shade's tokens — not the whole ramp."
            />
            <GuidancePanel
              title="Per palette"
              description="palette-pumpkin pulls the shades it needs; a registered-but-unused palette emits nothing."
            />
            <GuidancePanel
              title="No manual CSS"
              description="You never hand-write shade variables — declare the anchors and the ramp, dark mode, and contrast are generated."
            />
          </div>
        </DocSection>
      </DocSection>

      <DocSection title="Next steps">
        <div className="grid gap-3 tablet:grid-cols-2">
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
                See how a theme assembles palettes into a whole color scheme and
                switches schemes.
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
                See palette modifiers applied through component classes.
              </p>
            </div>
          </Link>
        </div>
      </DocSection>

      <DocPager
        previous={{ href: "/core/theming", label: "Theming" }}
        next={{ href: "/components/button", label: "Button" }}
      />
    </DocPage>
  );
}

function SchemeRamp({
  name,
  side,
  label,
  hint,
}: {
  name: string;
  side: "light" | "dark";
  label: string;
  hint: string;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <div className="text-sm font-semibold">{label}</div>
        <code className="code-soft/surface code text-[0.65rem]">{hint}</code>
      </div>
      <div className="grid grid-cols-11 overflow-hidden rounded-md border border-surface-600/20">
        {PALETTE_SHADES.map((shade) => (
          <span
            key={shade}
            className="flex h-12 items-end justify-center pb-1 text-[10px] font-medium"
            style={{
              backgroundColor: `var(--color-${side}-${name}-${shade})`,
              color: `var(--color-on-${side}-${name}-${shade})`,
            }}
          >
            {shade}
          </span>
        ))}
      </div>
    </div>
  );
}

function PaletteRamp({
  name,
  flush = false,
}: {
  name: string;
  flush?: boolean;
}) {
  return (
    <div
      className={
        flush ? "grid grid-cols-11" : (
          "grid grid-cols-11 overflow-hidden rounded-md border border-surface-600/20"
        )
      }
    >
      {PALETTE_SHADES.map((shade) => (
        <span
          key={shade}
          className="flex h-12 items-end justify-center pb-1 text-[10px] font-medium"
          style={{
            backgroundColor: `var(--color-light-${name}-${shade})`,
            color: `var(--color-on-light-${name}-${shade})`,
          }}
        >
          {shade}
        </span>
      ))}
    </div>
  );
}

function BuiltinPalette({
  name,
  paletteClass,
}: {
  name: string;
  paletteClass: string;
}) {
  return (
    <div className={`${paletteClass} card card-soft/surface`}>
      <div data-slot="content" className="gap-3">
        <div className="text-sm font-semibold capitalize">{name}</div>
        <div className="overflow-hidden rounded-md border border-surface-600/20">
          <code className="code-soft/surface code block w-full rounded-none border-b border-surface-600/20 text-xs">
            bg-{name}-500 · {paletteClass}
          </code>
          <PaletteRamp name={name} flush />
        </div>
      </div>
    </div>
  );
}

function BuiltinColorGrid() {
  return (
    <div className="grid gap-1.5">
      {BUILTIN_COLOR_DEMO.map((paletteClass) => (
        <div
          key={paletteClass}
          className={`${paletteClass} grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3`}
        >
          <span className="text-xs font-medium capitalize">
            {paletteClass.replace("palette-", "")}
          </span>
          <div className="grid grid-cols-11 overflow-hidden rounded-md border border-surface-600/20">
            {PALETTE_SHADES.map((shade) => (
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

function ToneDemo({ palette, label }: { palette: string; label: string }) {
  return (
    <div
      className={`${palette} overflow-hidden rounded-lg border border-500/30`}
    >
      <div className="px-3 pt-3 pb-2 text-xs font-semibold text-700">
        {label}
      </div>
      <div className="grid grid-cols-3">
        <span className="flex h-12 items-center justify-center bg-100 text-[10px] text-on-100">
          bg-100
        </span>
        <span className="flex h-12 items-center justify-center bg-500 text-[10px] text-on-500">
          bg-500
        </span>
        <span className="flex h-12 items-center justify-center bg-800 text-[10px] text-on-800">
          bg-800
        </span>
      </div>
    </div>
  );
}

function CodeBlock({
  title,
  description,
  code,
  language,
}: {
  title: ReactNode;
  description: ReactNode;
  code: string;
  language: "js" | "ts" | "css" | "html";
}) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-2">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-xs/6 text-surface-950/65">{description}</p>
      </div>
      <ServerFormattedCodeSnippet code={code} language={language} />
    </div>
  );
}

function ProcessCard({
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

function GuidancePanel({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-2">
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-xs/6 text-surface-950/65">{description}</p>
      </div>
    </div>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="code-soft/surface code text-xs">{children}</code>;
}
