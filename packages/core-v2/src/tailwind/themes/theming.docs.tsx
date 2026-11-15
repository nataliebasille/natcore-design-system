import {
  docs,
  PALETTE,
  type Palette,
  type Shade,
} from "@nataliebasille/css-engine";

const { Page, Section } = docs();

const ROLE_DESCRIPTIONS: Record<Palette, string> = {
  primary: "Primary actions, selected states, and the main brand direction.",
  secondary: "Supporting actions and secondary moments that still need color.",
  accent: "Highlights, emphasis, and moments that should stand apart.",
  surface: "Page backgrounds, containers, borders, and neutral text.",
  success: "Positive outcomes, confirmations, and valid states.",
  danger: "Destructive actions, errors, and blocking states.",
  disabled: "Unavailable controls, subdued text, and inactive surfaces.",
};

const THEME_DEFINITION = `:root[data-theme="citrine-reef"] {
  --theme-primary: #087f8c;
  --theme-secondary: #f59e0b;
  --theme-accent: #ef476f;

  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;

  --theme-danger: #c2415d;
  --theme-success: #26966f;
}`;

const LIGHT_DARK = `<html class="scheme-light-dark" data-theme="citrine-reef">
  <body>
    <button class="btn-solid/primary">Create project</button>
  </body>
</html>`;

const ROLE_ANCHORS = `:root[data-theme="custom"] {
  /* A single color per role is enough… */
  --theme-primary: #087f8c;

  /* …or pin any shade 50-950 for a role, using the
     same anchor model palettes use. */
  --theme-primary-300: #4aa3c7;

  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;
}`;

export default (
  <Page
    title="Theming"
    description="A theme is a named set of role colors you select with data-theme. Components keep using the same token classes while the active theme changes the values underneath; light and dark are a separate scheme axis."
    nav={{ group: "Core", order: 2, path: "/core/theming" }}
  >
    <Section
      title="How themes work"
      description="A theme sets the color for each semantic role. Natcore expands those roles into full palettes — see Palette for the shade mechanics — and components consume the resulting adaptive tokens."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        <StepCard
          label="01"
          title="Assign role colors"
          description="A theme gives each semantic role — primary, secondary, accent, surface, danger, success — a color or anchors."
        />
        <StepCard
          label="02"
          title="Select with data-theme"
          description="Switching data-theme swaps the whole role set. Component and utility classes never change."
        />
        <StepCard
          label="03"
          title="Pick a scheme"
          description="Light and dark are a separate axis controlled by scheme-* classes, so one theme serves both."
        />
      </div>
    </Section>

    <Section
      title="Semantic roles"
      description="A theme assigns a color to each of these roles. Markup references the role by intent — not a specific hex — so the same components work across every theme. These roles are the stable API; a theme changes the values underneath them."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3">
        {PALETTE.map((role) => (
          <RolePanel role={role} />
        ))}
      </div>
    </Section>

    <Section
      title="Theme identity"
      description="Use data-theme to select a named palette. The selector defines role values Natcore uses to build the rest of the token system."
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-4">
        <code>{THEME_DEFINITION}</code>

        <div className="card-soft/surface">
          <div data-slot="content" className="gap-3">
            <div className="text-sm font-semibold">Stable markup</div>
            <p className="text-surface-950/65 text-xs/6">
              Classes like{" "}
              <code className="code-inline text-xs">btn-solid/primary</code> and{" "}
              <code className="code-inline text-xs">card-soft/surface</code>{" "}
              stay the same when the selected theme changes.
            </p>
          </div>
        </div>
      </div>
    </Section>

    <Section
      title="Anchoring role colors"
      description="Within a theme, each role is a palette. Give a role a single color or pin specific shades with --theme-{role}-{shade} — Natcore fills in the rest of the ramp. This is the same anchor model documented on the Palette page, applied to a theme's roles."
    >
      <code>{ROLE_ANCHORS}</code>
    </Section>

    <Section
      title="Light and dark"
      description="Natcore treats theme choice and light/dark choice as separate concerns. data-theme selects the palette; the scheme class controls which side of each adaptive token is used."
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-4">
        <code>{LIGHT_DARK}</code>

        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
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
    </Section>

    <Section title="Next steps">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        <NextStep
          href="/core/palette"
          title="Palette"
          description="See how each role becomes a full shade ramp — and define your own palettes."
        />
        <NextStep
          href="/components/button"
          title="Components"
          description="See adaptive theme tokens applied through component modifiers."
        />
      </div>
    </Section>
  </Page>
);

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

function ModePanel({
  title,
  description,
  swatches,
}: {
  title: string;
  description: string;
  swatches: string[];
}) {
  return (
    <div className="card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="border-surface-600/20 grid grid-cols-3 overflow-hidden rounded-md border">
          {swatches.map((swatch) => (
            <span className="h-10" style={{ backgroundColor: swatch }} />
          ))}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <p className="text-surface-950/65 text-xs/6">{description}</p>
        </div>
      </div>
    </div>
  );
}

function RolePanel({ role }: { role: Palette }) {
  return (
    <div className="card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold capitalize">{role}</div>
            <p className="text-surface-950/65 text-xs/6">
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>

          <div className="border-surface-600/20 flex overflow-hidden rounded-md border">
            {([50, 500, 950] as const).map((shade) => (
              <span
                className="block size-8"
                style={{ backgroundColor: colorToken(role, shade) }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <code className="code-inline text-xs">--theme-{role}</code>
        </div>
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

function colorToken(palette: Palette, shade: Shade) {
  return `var(--color-${palette}-${shade})`;
}
