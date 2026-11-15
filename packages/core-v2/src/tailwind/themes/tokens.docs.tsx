import { docs } from "@nataliebasille/css-engine";

const { Page, Section } = docs();

const TOKEN_REFERENCE = `/* Adaptive base + readable foreground, per role and shade */
--color-primary-500;        /* light-dark() base color */
--color-on-primary-500;     /* contrast foreground for that base */

/* The current-tone aliases resolve to the active palette */
--color-500;                /* = --color-{active}-500 */
--color-on-500;             /* = --color-on-{active}-500 */

/* Explicit scheme sides, when you need to pin light or dark */
--color-light-primary-500;
--color-dark-primary-500;`;

const THEME_OVERRIDE = `:root[data-theme="citrine-reef"] {
  /* Seed a role with one color… */
  --theme-primary: #087f8c;

  /* …or pin any shade 50-950 */
  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;
}`;

export default (
  <Page
    title="Core Tokens"
    description="Tokens are the CSS custom properties Natcore provides. Components and utilities read them, themes set their values, and palettes expand them into full shade ramps."
    nav={{ label: "Tokens", group: "Foundations", order: 1, path: "/core/tokens" }}
  >
    <Section
      title="Anatomy of a token"
      description="Every color token is addressed by three facets. Together they name an exact, theme-aware color."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        <StepCard
          label="01"
          title="Role"
          description="The semantic slot a token belongs to: primary, surface, danger, success, and the rest of the theme's roles."
        />
        <StepCard
          label="02"
          title="Shade"
          description="A step on the 50-950 scale. Lower numbers are softer, higher numbers carry stronger contrast."
        />
        <StepCard
          label="03"
          title="Tone"
          description="Each base token (--color-{role}-{shade}) is paired with a readable foreground token (--color-on-{role}-{shade})."
        />
      </div>
    </Section>

    <Section
      title="Color token families"
      description="These are the CSS variables Natcore exposes. Reference them directly, or reach them through utilities and component classes (see Palette)."
    >
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3">
        <TokenFamilyCard
          token="--color-{role}-{shade}"
          description="The adaptive base color for a role and shade. Resolves to the light or dark value for the active scheme via light-dark()."
          swatch="var(--color-primary-500)"
        />
        <TokenFamilyCard
          token="--color-on-{role}-{shade}"
          description="A readable foreground paired with the matching base token, generated for contrast against it."
          swatch="var(--color-on-primary-500)"
        />
        <TokenFamilyCard
          token="--color-{shade}"
          description="A current-tone alias that resolves to whatever palette is active on the element, so the same markup re-tones with the palette."
          swatch="var(--color-primary-500)"
        />
        <TokenFamilyCard
          token="--color-on-{shade}"
          description="The current-tone foreground alias, pairing with --color-{shade} against the active palette."
          swatch="var(--color-on-primary-500)"
        />
        <TokenFamilyCard
          token="--color-light-{role}-{shade}"
          description="The explicit light-scheme side of a base token, useful when you need to pin the light value regardless of scheme."
          swatch="var(--color-light-primary-500)"
        />
        <TokenFamilyCard
          token="--color-dark-{role}-{shade}"
          description="The explicit dark-scheme side of a base token, the counterpart to the light family."
          swatch="var(--color-dark-primary-500)"
        />
      </div>

      <code>{TOKEN_REFERENCE}</code>
    </Section>

    <Section
      title="Theme override tokens"
      description="A theme sets a role's color by writing --theme-{role} (or --theme-{role}-{shade} to pin a specific anchor). Natcore reads these seeds to derive every other token above. This is the only part of the token system you usually write by hand — the rest is generated."
    >
      <code>{THEME_OVERRIDE}</code>
    </Section>

    <Section title="Next steps">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        <NextStep
          href="/core/theming"
          title="Theming"
          description="Choose the role colors and schemes that give these tokens their values."
        />
        <NextStep
          href="/core/palette"
          title="Palette"
          description="See how a single color becomes a full ramp, and the classes you type to use these tokens."
        />
        <NextStep
          href="/components/actions/button"
          title="Components"
          description="See how component classes consume these tokens."
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

function TokenFamilyCard({
  token,
  description,
  swatch,
}: {
  token: string;
  description: string;
  swatch: string;
}) {
  return (
    <div className="card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="flex items-center gap-3">
          <span
            className="border-surface-600/20 block size-8 shrink-0 rounded-md border"
            style={{ backgroundColor: swatch }}
          />
          <code className="code-inline text-xs">{token}</code>
        </div>
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
