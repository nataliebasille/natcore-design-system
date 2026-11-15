import { docs } from "@nataliebasille/css-engine";

const { Page, Section, Example } = docs();

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

const POSTCSS_CONFIG = `// postcss.config.js — the Natcore transform runs BEFORE Tailwind
module.exports = {
  plugins: {
    "@nataliebasille/natcore-design-system/postcss": {},
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};`;

const VITE_CONFIG = `// vite.config.ts — use the Vite variant instead
import natcorePalettes from "@nataliebasille/natcore-design-system/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // natcorePalettes() must come before tailwindcss()
  plugins: [natcorePalettes(), tailwindcss()],
});`;

const DECLARE_PALETTES = `@import "tailwindcss";
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

const PUMPKIN_PALETTE = `@natcore-palettes {
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

const DARK_FLIP = `/* Dark is the light ramp, mirrored end-to-end */
--color-dark-primary-50:  var(--color-light-primary-950);
--color-dark-primary-100: var(--color-light-primary-900);
/* …200↔800, 300↔700, 400↔600, 500 stays… */
--color-dark-primary-950: var(--color-light-primary-50);

/* The adaptive token picks the active scheme's side */
--color-primary-500: light-dark(
  var(--color-light-primary-500),
  var(--color-dark-primary-500)
);`;

export default (
  <Page
    title="Palette"
    description="A palette is a single color expanded into a full 50-950 shade ramp. Every palette comes from a theme: a theme assigns a color to each role, and Natcore builds the ramp, mirrors it for dark mode, and exposes adaptive tokens. You can also define your own palettes."
    nav={{ group: "Core", order: 3, path: "/core/palette" }}
  >
    <Section
      title="Palettes come from themes"
      description="A theme is a whole color scheme; a palette is one color within it. The theme assigns a color (or anchors) to each role, and Natcore turns each into a full ramp through the same anchor model — so every palette, built-in or custom, works the same way."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
        <StepCard
          label="01"
          title="A theme assigns a color"
          description="A theme gives each role — primary, surface, and the rest — a single color or explicit anchors."
        />
        <StepCard
          label="02"
          title="Resolve anchors"
          description="A lone color becomes the 500 anchor; 50 and 950 derive from it. Any shade can be anchored explicitly."
        />
        <StepCard
          label="03"
          title="Derive the ramp"
          description="Unanchored shades interpolate between the bracketing anchors, and a readable on-color is generated for each."
        />
        <StepCard
          label="04"
          title="Mirror for dark"
          description="Dark-mode tokens point to the opposite side of the light ramp, so contrast flips without new markup."
        />
        <StepCard
          label="05"
          title="Expose tokens"
          description="The palette surfaces adaptive tokens like color-primary-500 that utilities and components read."
        />
      </div>
    </Section>

    <Section
      title="Light and dark"
      description="A palette is built once on the light side, then mirrored for dark: dark-{shade} points at the light ramp's opposite end — 50↔950, 100↔900, and so on, with 500 unchanged. A shade number keeps its semantic role but resolves to the other end of the ramp, so bg-surface-50 is a light surface in light mode and a dark surface in dark mode, with no markup change. The on-colors mirror the same way, so contrast flips automatically. Which side is active is the separate scheme axis — see Theming."
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-4">
        <div className="card-soft/surface">
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

        <code>{DARK_FLIP}</code>
      </div>
    </Section>

    <Section
      title="Theme role palettes"
      description="Natcore ships two families of ready-made palettes: the semantic theme-role palettes and every built-in Tailwind color. Both expand through the same anchor model, flip in dark mode, and auto-contrast their text. A theme defines six semantic roles. Markup references the role, not a hex, so the same components work across every theme — see Theming for what each role is for. Each ramp below is live, rendered from this site's active theme."
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-3">
        {BUILTIN_PALETTES.map((palette) => (
          <BuiltinPalette
            name={palette.name}
            paletteClass={palette.paletteClass}
          />
        ))}
      </div>

      <NextStep
        href="/core/theming"
        title="What each role means"
        description="Theming documents the intent of primary, secondary, accent, surface, success, danger, and disabled."
      />
    </Section>

    <Section
      title="Tailwind color palettes"
      description="Every built-in Tailwind color is available as a palette-{color} class out of the box. Like role palettes, they flip in dark mode (50 <-> 950), auto-contrast their text, and expose a per-shade --theme-{color}-{shade} override."
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-4">
        <BuiltinColorGrid />

        <div className="card-soft/surface">
          <div data-slot="content" className="gap-3">
            <div>
              <div className="text-sm font-semibold">Supported colors</div>
              <p className="text-surface-950/65 text-xs/6">
                Every built-in Tailwind color is available as a palette class.
              </p>
            </div>

            <p className="text-surface-950/70 text-xs/6">
              {BUILTIN_COLOR_NAMES}
            </p>

            <div className="text-surface-950/55 flex flex-wrap items-center gap-2 text-xs">
              <span>Use as</span>
              <code className="code-inline text-xs">palette-{"{color}"}</code>
              <span>— for example</span>
              <code className="code-inline text-xs">palette-emerald</code>
            </div>
          </div>
        </div>
      </div>
    </Section>

    <Section
      title="Using a palette"
      description="There are three ways to reach a palette's colors: name it inline on a utility, set it once as the current tone and use shade-only utilities, or pass it as a component modifier."
    >
      <Example
        title="Named color utilities"
        description="Any color utility accepts {palette}-{shade}. On-colors pair with backgrounds so text stays readable."
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-primary-500 text-on-primary-500 rounded-md px-3 py-1.5 text-sm">
            bg-primary-500
          </span>
          <span className="bg-accent-500 text-on-accent-500 rounded-md px-3 py-1.5 text-sm">
            bg-accent-500
          </span>
          <span className="text-secondary-700 text-sm font-semibold">
            text-secondary-700
          </span>
        </div>
      </Example>

      <Example
        title="The palette class and tone utilities"
        description="Set the current tone once with palette-{name}, then children use shade-only tone utilities like bg-{shade} and text-on-{shade}. Swap the palette class and the whole subtree re-tones with no other markup changes — a design-system role or a built-in Tailwind color both work."
      >
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
          <ToneDemo palette="palette-primary" label="palette-primary (role)" />
          <ToneDemo
            palette="palette-emerald"
            label="palette-emerald (built-in)"
          />
        </div>
      </Example>

      <Example
        title="Component modifiers"
        description="Components accept a /{palette} modifier, which sets the current tone for that component instance — a design-system role or a built-in Tailwind color both work."
      >
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-solid/primary">Primary (role)</button>
          <button className="btn-soft/accent">Accent (role)</button>
          <button className="btn-solid/emerald">Emerald (built-in)</button>
          <button className="btn-soft/sky">Sky (built-in)</button>
        </div>
      </Example>
    </Section>

    <Section
      title="Custom palettes"
      description="Beyond the six built-in roles, you can declare your own named palettes with the @natcore-palettes at-rule. They use the exact same anchor model, utilities, component modifiers, and per-shade tree-shaking — they are palettes in every way. The at-rule is expanded by a Natcore plugin that must run BEFORE Tailwind: add the PostCSS plugin, or the Vite variant for Vite-based setups. This step is required before the at-rule will do anything."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
        <CodeBlock
          title="PostCSS"
          description="Add it to postcss.config.js ahead of @tailwindcss/postcss."
          code={POSTCSS_CONFIG}
        />
        <CodeBlock
          title="Vite"
          description="Add it to vite.config ahead of @tailwindcss/vite."
          code={VITE_CONFIG}
        />
      </div>
    </Section>

    <Section
      title="Declaring palettes"
      description="With the plugin installed, declare each palette with the flat {name} / {name}-{shade} syntax. It is the same anchor model a theme uses for its roles: a single color, 50/500/950 anchors, intermediate nudges, or a fully explicit ramp. Order does not matter."
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-4">
        <code>{DECLARE_PALETTES}</code>

        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
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
      </div>
    </Section>

    <Section
      title="Example: pumpkin"
      description="A fully explicit eleven-shade ramp. Every swatch below is live — rendered from the generated light-side --color-light-pumpkin-{shade} tokens (the canonical 50→950 ramp) in this site's own theme."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
        <code>{PUMPKIN_PALETTE}</code>

        <div className="card-soft/surface">
          <div data-slot="content" className="gap-3">
            <div className="text-sm font-semibold">Generated ramp</div>
            <p className="text-surface-950/65 text-xs/6">
              <code className="code-inline text-xs">--color-pumpkin-50</code>{" "}
              through{" "}
              <code className="code-inline text-xs">--color-pumpkin-950</code>,
              each paired with a readable{" "}
              <code className="code-inline text-xs">
                --color-on-pumpkin-{"{shade}"}
              </code>{" "}
              text color.
            </p>
            <PaletteRamp name="pumpkin" />
          </div>
        </div>
      </div>
    </Section>

    <Section
      title="Using a custom palette"
      description="A custom palette unlocks the full token surface: native color utilities, the palette-{name} tone modifier, and component modifiers like btn-solid/pumpkin."
    >
      <Example title="Live pumpkin">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-solid/pumpkin">Carve</button>
            <button className="btn-soft/pumpkin">Soft</button>
            <button className="btn-outline/pumpkin">Outline</button>
            <button className="btn-ghost/pumpkin">Ghost</button>
          </div>

          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
            <div className="card-soft/pumpkin">
              <div data-slot="content" className="gap-1">
                <div className="text-sm font-semibold">card-soft/pumpkin</div>
                <p className="text-xs/6">
                  Component modifiers accept the custom palette name just like a
                  built-in role.
                </p>
              </div>
            </div>

            <ToneDemo palette="palette-pumpkin" label="palette-pumpkin" />
          </div>
        </div>
      </Example>
    </Section>

    <Section
      title="Tree-shaking"
      description="Because the transform generates custom palettes through the same pipeline as the built-ins, Tailwind prunes what you don't use."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
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
    </Section>

    <Section title="Next steps">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        <NextStep
          href="/core/theming"
          title="Theming"
          description="See how a theme assembles palettes into a whole color scheme and switches schemes."
        />
        <NextStep
          href="/components/button"
          title="Components"
          description="See palette modifiers applied through component classes."
        />
      </div>
    </Section>
  </Page>
);

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
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <div className="text-sm font-semibold">{label}</div>
        <code className="code text-[0.65rem]">{hint}</code>
      </div>
      <div className="border-surface-600/20 grid grid-cols-11 overflow-hidden rounded-md border">
        {PALETTE_SHADES.map((shade) => (
          <span
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
          "border-surface-600/20 grid grid-cols-11 overflow-hidden rounded-md border"
        )
      }
    >
      {PALETTE_SHADES.map((shade) => (
        <span
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
    <div className={[paletteClass, "card-soft/surface"].join(" ")}>
      <div data-slot="content" className="gap-3">
        <div className="text-sm font-semibold capitalize">{name}</div>
        <div className="border-surface-600/20 overflow-hidden rounded-md border">
          <code className="code border-surface-600/20 block w-full rounded-none border-b text-xs">
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
    <div className="grid w-full gap-1.5">
      {BUILTIN_COLOR_DEMO.map((paletteClass) => (
        <div
          className={[
            paletteClass,
            "grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3",
          ].join(" ")}
        >
          <span className="text-xs font-medium capitalize">
            {paletteClass.replace("palette-", "")}
          </span>
          <div className="border-surface-600/20 grid grid-cols-11 overflow-hidden rounded-md border">
            {PALETTE_SHADES.map((shade) => (
              <span
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
      className={[
        palette,
        "border-500/30 overflow-hidden rounded-lg border",
      ].join(" ")}
    >
      <div className="text-700 px-3 pt-3 pb-2 text-xs font-semibold">
        {label}
      </div>
      <div className="grid grid-cols-3">
        <span className="bg-100 text-on-100 flex h-12 items-center justify-center text-[10px]">
          bg-100
        </span>
        <span className="bg-500 text-on-500 flex h-12 items-center justify-center text-[10px]">
          bg-500
        </span>
        <span className="bg-800 text-on-800 flex h-12 items-center justify-center text-[10px]">
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
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-2">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-surface-950/65 text-xs/6">{description}</p>
      </div>
      <code>{code}</code>
    </div>
  );
}

function StepCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card-soft/surface">
      <div data-slot="content" className="gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="bg-surface-50 text-on-surface-50 flex size-7 items-center justify-center rounded-md text-xs">
            {label}
          </span>
          {title}
        </div>
        <p className="text-surface-950/65 text-xs/6">{description}</p>
      </div>
    </div>
  );
}

function GuidancePanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card-soft/surface">
      <div data-slot="content" className="gap-2">
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-surface-950/65 text-xs/6">{description}</p>
      </div>
    </div>
  );
}

function NextStep({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a href={href} className="card-hover card-soft/surface">
      <div data-slot="content" className="gap-2">
        <div className="text-sm font-semibold">{title} →</div>
        <p className="text-surface-950/65 text-xs/6">{description}</p>
      </div>
    </a>
  );
}
