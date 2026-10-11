import { ServerFormattedCodeSnippet } from "@/ui/code-snippet/server-formatted-code-snippet";
import { DocPager } from "@/ui/doc/doc-pager";
import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { ArrowRightIcon } from "@/ui/icons";
import Link from "next/link";
import { type ReactNode } from "react";

const themeDefinitionExample = `:root[data-theme="citrine-reef"] {
  --theme-primary: #087f8c;
  --theme-secondary: #f59e0b;
  --theme-accent: #ef476f;

  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;

  --theme-danger: #c2415d;
  --theme-success: #26966f;
}`;

const explicitAnchorExample = `:root[data-theme="custom"] {
  --theme-primary-50: #eef8ff;
  --theme-primary-300: #4aa3c7;
  --theme-primary-500: #087f8c;
  --theme-primary-950: #061a21;
}

/* Any shade 50-950 can be anchored.
   Pin every shade for a fully explicit ramp;
   unanchored shades interpolate between 50/500/950. */`;

const singleAnchorExample = `:root[data-theme="custom"] {
  --theme-primary: #087f8c;
}

/* Equivalent anchor behavior:
   primary-500 uses #087f8c.
   primary-50 and primary-950 are derived. */`;

const lightDarkExample = `<html class="scheme-light-dark" data-theme="citrine-reef">
  <body>
    <button class="btn-solid/primary">Create project</button>
  </body>
</html>`;

const tokenResolutionExample = `@theme {
  --color-primary-50: light-dark(
    var(--color-light-primary-50),
    var(--color-dark-primary-50)
  );

  --color-dark-primary-50: var(--color-light-primary-950);
}`;

const pinIntermediateExample = `:root[data-theme="custom"] {
  --theme-primary: #087f8c;

  /* Pin a single step. Every other shade,
     including 50/500/950, stays derived. */
  --theme-primary-300: #4aa3c7;
}`;

const pinFullRampExample = `:root[data-theme="custom"] {
  /* Pin all eleven shades to bypass
     interpolation and reproduce an exact ramp
     (e.g. mirror an existing brand palette). */
  --theme-primary-50: #eef8ff;
  --theme-primary-100: #d9eefc;
  --theme-primary-200: #b6ddf7;
  --theme-primary-300: #85c6f0;
  --theme-primary-400: #4aa3c7;
  --theme-primary-500: #087f8c;
  --theme-primary-600: #0a6b76;
  --theme-primary-700: #0d555d;
  --theme-primary-800: #103f45;
  --theme-primary-900: #112f34;
  --theme-primary-950: #061a21;
}`;

const THEME_SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

const themeSteps = [
  {
    label: "01",
    title: "Choose semantic roles",
    description:
      "Themes set palette roles like primary, secondary, accent, surface, danger, and success.",
  },
  {
    label: "02",
    title: "Resolve anchors",
    description:
      "Each role can anchor any shade from 50 to 950. If a role only provides one color, that color becomes the 500 anchor.",
  },
  {
    label: "03",
    title: "Derive shade ramps",
    description:
      "Natcore derives missing 50 and 950 anchors, interpolates any unanchored shades, and generates matching on-color text values.",
  },
  {
    label: "04",
    title: "Mirror dark colors",
    description:
      "Dark-mode tokens point to the opposite side of the light ramp, so contrast flips without new markup.",
  },
  {
    label: "05",
    title: "Resolve adaptive tokens",
    description:
      "Component and utility classes use adaptive tokens like color-primary-500, which resolve through the active scheme.",
  },
] as const;

export default function CoreThemingPage() {
  return (
    <DocPage
      title="Theming"
      description="Themes provide palette identity while Natcore's adaptive color tokens keep the same UI working in light and dark schemes."
    >
      <DocSection
        title="How themes work"
        description="A theme is a set of semantic color anchors. Components keep using token classes, and the active theme changes the values underneath."
      >
        <div className="grid gap-3 tablet:grid-cols-2">
          {themeSteps.map((step) => (
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
        title="Theme identity"
        description="Use data-theme to select a named palette. The selector defines role values Natcore uses to build the rest of the token system."
      >
        <div className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_18rem]">
          <ServerFormattedCodeSnippet
            code={themeDefinitionExample}
            language="css"
          />

          <div className="card self-start card-soft/surface">
            <div data-slot="content" className="gap-3">
              <div className="text-sm font-semibold">Stable markup</div>
              <p className="text-xs/6 text-surface-950/65">
                Classes like <InlineCode>btn-solid/primary</InlineCode> and{" "}
                <InlineCode>card-soft/surface</InlineCode> stay the same when
                the selected theme changes.
              </p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Anchor system"
        description="Every palette role can anchor any shade from 50 to 950. If no anchors are provided, the role color becomes the 500 anchor and Natcore derives 50 and 950 from it; any unanchored shades are interpolated."
      >
        <div className="grid items-stretch gap-4 desktop:grid-cols-2">
          <AnchorExample
            title="Explicit anchors"
            description="Pin any shade from 50 to 950 — including intermediates — where the exact color matters. Pin every shade for a fully explicit ramp."
            code={explicitAnchorExample}
          />
          <AnchorExample
            title="Single color fallback"
            description="Use this when you only know the main role color. Natcore treats it as 500 and derives the outer anchors."
            code={singleAnchorExample}
          />
        </div>

        <div className="grid gap-3 tablet:grid-cols-3">
          <GuidancePanel
            title="50"
            description="The light anchor. Used for soft fills, subtle surfaces, and the light end of the role ramp."
          />
          <GuidancePanel
            title="500"
            description="The center anchor. A bare role variable like --theme-primary resolves here."
          />
          <GuidancePanel
            title="950"
            description="The dark anchor. Used for strong contrast, deep fills, and the mirrored side of dark mode."
          />
        </div>
      </DocSection>

      <DocSection
        title="Per-shade anchoring"
        description="Anchoring is not limited to 50, 500, and 950 — any shade can be pinned with --theme-{role}-{shade}. A pinned shade changes only itself, so you can nudge a single step or pin the whole ramp for exact control."
      >
        <div className="grid items-stretch gap-4 desktop:grid-cols-2">
          <AnchorExample
            title="Pin a single intermediate"
            description="Override one step like 300. The 50/500/950 anchors and every other shade keep their derived values — neighbors are not re-bracketed."
            code={pinIntermediateExample}
          />
          <AnchorExample
            title="Pin the full ramp"
            description="Provide all eleven shades to bypass interpolation entirely — ideal for mirroring an existing brand or Tailwind palette exactly."
            code={pinFullRampExample}
          />
        </div>

        <ShadeRamp />

        <div className="grid gap-3 tablet:grid-cols-3">
          <GuidancePanel
            title="Any shade, any time"
            description="--theme-primary-200, --theme-accent-700, and so on are all valid. Pin only the steps you care about."
          />
          <GuidancePanel
            title="Independent by design"
            description="Pinning 300 does not shift 200 or 400. Unpinned shades keep interpolating between the 50, 500, and 950 anchors."
          />
          <GuidancePanel
            title="Pin at the theme level"
            description="Declare per-shade anchors in the same data-theme block as the role color so Natcore resolves them into the ramp."
          />
        </div>
      </DocSection>

      <DocSection
        title="Light and dark"
        description="Natcore treats theme choice and light/dark choice as separate concerns. data-theme selects the palette; the scheme class controls which side of each adaptive token is used."
      >
        <div className="grid gap-4">
          <ServerFormattedCodeSnippet code={lightDarkExample} language="html" />

          <div className="grid gap-3 tablet:grid-cols-3">
            <ModePanel
              title="scheme-light"
              description="Always resolves adaptive tokens to the light color ramp."
              swatches={[
                "var(--color-light-primary-50)",
                "var(--color-light-primary-500)",
                "var(--color-light-primary-950)",
              ]}
            />
            <ModePanel
              title="scheme-dark"
              description="Always resolves adaptive tokens to the dark color ramp."
              swatches={[
                "var(--color-dark-primary-50)",
                "var(--color-dark-primary-500)",
                "var(--color-dark-primary-950)",
              ]}
            />
            <ModePanel
              title="scheme-light-dark"
              description="Lets the browser resolve light-dark tokens from the user's color scheme."
              swatches={[
                "var(--color-primary-50)",
                "var(--color-primary-500)",
                "var(--color-primary-950)",
              ]}
            />
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Adaptive token resolution"
        description="For each palette and shade, Natcore exposes explicit light and dark variables plus an adaptive variable that chooses between them."
      >
        <div className="grid gap-4 desktop:grid-cols-[minmax(0,1fr)_18rem]">
          <ServerFormattedCodeSnippet
            code={tokenResolutionExample}
            language="css"
          />

          <div className="card self-start card-soft/surface">
            <div data-slot="content" className="gap-3">
              <div className="text-sm font-semibold">
                Contrast travels with the token
              </div>
              <p className="text-xs/6 text-surface-950/65">
                On-color tokens follow the same pattern. A surface can use{" "}
                <InlineCode>bg-primary-500</InlineCode> while text uses{" "}
                <InlineCode>text-on-primary-500</InlineCode>, and both resolve
                together.
              </p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Authoring guidance"
        description="Theme authors can provide one main color for speed or explicit anchors for control, then let Natcore produce the adaptive values consumed by components."
      >
        <div className="grid gap-3 tablet:grid-cols-3">
          <GuidancePanel
            title="Anchor only what matters"
            description="Pin any shade (50-950) where the exact color matters, or pin every shade for a fully explicit ramp. Use a single role color when derived anchors are enough."
          />
          <GuidancePanel
            title="Keep roles semantic"
            description="Primary should mean primary action across every theme, even when its actual hue changes."
          />
          <GuidancePanel
            title="Test both schemes"
            description="Check light and dark because dark mode uses mirrored shade relationships, not a separate set of component classes."
          />
        </div>
      </DocSection>

      <DocSection title="Next steps">
        <div className="grid gap-3 tablet:grid-cols-2">
          <Link
            href="/core/tokens"
            className="card card-hover card-soft/surface"
          >
            <div data-slot="content" className="gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                Tokens
              </div>
              <p className="text-xs/6 text-surface-950/65">
                Review the palette roles and shade scale that themes feed into.
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
                See adaptive theme tokens applied through component modifiers.
              </p>
            </div>
          </Link>
        </div>
      </DocSection>

      <DocPager
        previous={{ href: "/core/tokens", label: "Tokens" }}
        next={{ href: "/components/button", label: "Button" }}
      />
    </DocPage>
  );
}

function AnchorExample({
  title,
  description,
  code,
}: {
  title: ReactNode;
  description: ReactNode;
  code: string;
}) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-2">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-xs/6 text-surface-950/65">{description}</p>
      </div>
      <ServerFormattedCodeSnippet code={code} language="css" />
    </div>
  );
}

function ShadeRamp() {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="text-sm font-semibold">
          Primary ramp (active theme)
        </div>
        <p className="text-xs/6 text-surface-950/65">
          Natcore builds the full 50&ndash;950 ramp from the theme anchors.
          Shades you do not pin are interpolated between the 50, 500, and 950
          anchors; pinning a shade replaces just that swatch.
        </p>
        <div className="grid grid-cols-11 overflow-hidden rounded-md border border-surface-600/20">
          {THEME_SHADES.map((shade) => (
            <span
              key={shade}
              className="flex h-12 items-end justify-center pb-1 text-[10px] font-medium"
              style={{
                backgroundColor: `var(--color-primary-${shade})`,
                color: `var(--color-on-primary-${shade})`,
              }}
            >
              {shade}
            </span>
          ))}
        </div>
      </div>
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

function ModePanel({
  title,
  description,
  swatches,
}: {
  title: ReactNode;
  description: ReactNode;
  swatches: string[];
}) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="grid grid-cols-3 overflow-hidden rounded-md border border-surface-600/20">
          {swatches.map((swatch) => (
            <span
              key={swatch}
              className="h-10"
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <p className="text-xs/6 text-surface-950/65">{description}</p>
        </div>
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
