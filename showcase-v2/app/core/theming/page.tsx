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
  --theme-primary-500: #087f8c;
  --theme-primary-950: #061a21;
}`;

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
      "Each role can provide 50, 500, and 950 anchors. If a role only provides one color, that color becomes the 500 anchor.",
  },
  {
    label: "03",
    title: "Derive shade ramps",
    description:
      "Natcore derives missing 50 and 950 anchors, then interpolates the full shade ramp and matching on-color text values.",
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
        description="Every palette role can define explicit 50, 500, and 950 anchors. If those anchors are not provided, the role color becomes the 500 anchor and Natcore derives 50 and 950 from it."
      >
        <div className="grid items-stretch gap-4 desktop:grid-cols-2">
          <AnchorExample
            title="Explicit anchors"
            description="Use this when a brand palette already has intentional light, middle, and dark stops."
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
            description="Use explicit 50, 500, and 950 anchors for roles where the exact ramp matters. Use a single role color when derived anchors are enough."
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
