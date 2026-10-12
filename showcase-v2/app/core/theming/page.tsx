import { ServerFormattedCodeSnippet } from "@/ui/code-snippet/server-formatted-code-snippet";
import { DocPager } from "@/ui/doc/doc-pager";
import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { ArrowRightIcon } from "@/ui/icons";
import { PALETTE, type Palette, type Shade } from "@nataliebasille/css-engine";
import Link from "next/link";
import { type ReactNode } from "react";

const roleDescriptions: Record<Palette, string> = {
  primary: "Primary actions, selected states, and the main brand direction.",
  secondary: "Supporting actions and secondary moments that still need color.",
  accent: "Highlights, emphasis, and moments that should stand apart.",
  surface: "Page backgrounds, containers, borders, and neutral text.",
  success: "Positive outcomes, confirmations, and valid states.",
  danger: "Destructive actions, errors, and blocking states.",
  disabled: "Unavailable controls, subdued text, and inactive surfaces.",
};

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

const lightDarkExample = `<html class="scheme-light-dark" data-theme="citrine-reef">
  <body>
    <button class="btn-solid/primary">Create project</button>
  </body>
</html>`;

const roleAnchorExample = `:root[data-theme="custom"] {
  /* A single color per role is enough… */
  --theme-primary: #087f8c;

  /* …or pin any shade 50-950 for a role, using the
     same anchor model palettes use. */
  --theme-primary-300: #4aa3c7;

  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;
}`;

const themeSteps = [
  {
    label: "01",
    title: "Assign role colors",
    description:
      "A theme gives each semantic role — primary, secondary, accent, surface, danger, success — a color or anchors.",
  },
  {
    label: "02",
    title: "Select with data-theme",
    description:
      "Switching data-theme swaps the whole role set. Component and utility classes never change.",
  },
  {
    label: "03",
    title: "Pick a scheme",
    description:
      "Light and dark are a separate axis controlled by scheme-* classes, so one theme serves both.",
  },
] as const;

export default function CoreThemingPage() {
  return (
    <DocPage
      title="Theming"
      description="A theme is a named set of role colors you select with data-theme. Components keep using the same token classes while the active theme changes the values underneath; light and dark are a separate scheme axis."
    >
      <DocSection
        title="How themes work"
        description="A theme sets the color for each semantic role. Natcore expands those roles into full palettes — see Palette for the shade mechanics — and components consume the resulting adaptive tokens."
      >
        <div className="grid gap-3 tablet:grid-cols-3">
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
        title="Semantic roles"
        description="A theme assigns a color to each of these roles. Markup references the role by intent — not a specific hex — so the same components work across every theme. These roles are the stable API; a theme changes the values underneath them."
      >
        <div className="grid gap-3 tablet:grid-cols-2">
          {PALETTE.map((role) => (
            <RolePanel key={role} role={role} />
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
                <InlineCode>card-soft/surface</InlineCode> stay the same when the
                selected theme changes.
              </p>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        title="Anchoring role colors"
        description="Within a theme, each role is a palette. Give a role a single color or pin specific shades with --theme-{role}-{shade} — Natcore fills in the rest of the ramp. This is the same anchor model documented on the Palette page, applied to a theme's roles."
      >
        <div className="grid gap-4">
          <ServerFormattedCodeSnippet code={roleAnchorExample} language="css" />
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

      <DocSection title="Next steps">
        <div className="grid gap-3 tablet:grid-cols-2">
          <Link
            href="/core/palette"
            className="card card-hover card-soft/surface"
          >
            <div data-slot="content" className="gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ArrowRightIcon className="size-4 text-accent-500" />
                Palette
              </div>
              <p className="text-xs/6 text-surface-950/65">
                See how each role becomes a full shade ramp — and define your own
                palettes.
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
        next={{ href: "/core/palette", label: "Palette" }}
      />
    </DocPage>
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

function RolePanel({ role }: { role: Palette }) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold capitalize">{role}</div>
            <p className="text-xs/6 text-surface-950/65">
              {roleDescriptions[role]}
            </p>
          </div>

          <div className="flex overflow-hidden rounded-md border border-surface-600/20">
            {([50, 500, 950] as const).map((shade) => (
              <span
                key={shade}
                className="block size-8"
                style={{ backgroundColor: colorToken(role, shade) }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <InlineCode>--theme-{role}</InlineCode>
        </div>
      </div>
    </div>
  );
}

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="code-soft/surface code text-xs">{children}</code>;
}

function colorToken(palette: Palette, shade: Shade) {
  return `var(--color-${palette}-${shade})`;
}
