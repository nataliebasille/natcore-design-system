import { ServerFormattedCodeSnippet } from "@/ui/code-snippet/server-formatted-code-snippet";
import { DocPager } from "@/ui/doc/doc-pager";
import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { ArrowRightIcon } from "@/ui/icons";
import Link from "next/link";
import { type ReactNode } from "react";

const tokenReferenceExample = `/* Adaptive base + readable foreground, per role and shade */
--color-primary-500;        /* light-dark() base color */
--color-on-primary-500;     /* contrast foreground for that base */

/* The current-tone aliases resolve to the active palette */
--color-500;                /* = --color-{active}-500 */
--color-on-500;             /* = --color-on-{active}-500 */

/* Explicit scheme sides, when you need to pin light or dark */
--color-light-primary-500;
--color-dark-primary-500;`;

const overrideTokenExample = `:root[data-theme="citrine-reef"] {
  /* Seed a role with one color… */
  --theme-primary: #087f8c;

  /* …or pin any shade 50-950 */
  --theme-surface-50: #f4fbf7;
  --theme-surface-500: #678f82;
  --theme-surface-950: #071c18;
}`;

export default function CoreTokensPage() {
  return (
    <DocPage
      title="Core Tokens"
      description="Tokens are the CSS custom properties Natcore provides. Components and utilities read them, themes set their values, and palettes expand them into full shade ramps."
    >
      <DocSection
        title="Anatomy of a token"
        description="Every color token is addressed by three facets. Together they name an exact, theme-aware color."
      >
        <div className="grid gap-3 tablet:grid-cols-3">
          <TokenModelCard
            label="01"
            title="Role"
            description="The semantic slot a token belongs to: primary, surface, danger, success, and the rest of the theme's roles."
          />
          <TokenModelCard
            label="02"
            title="Shade"
            description="A step on the 50-950 scale. Lower numbers are softer, higher numbers carry stronger contrast."
          />
          <TokenModelCard
            label="03"
            title="Tone"
            description="Each base token (--color-{role}-{shade}) is paired with a readable foreground token (--color-on-{role}-{shade})."
          />
        </div>
      </DocSection>

      <DocSection
        title="Color token families"
        description="These are the CSS variables Natcore exposes. Reference them directly, or reach them through utilities and component classes (see Palette)."
      >
        <div className="grid gap-3 tablet:grid-cols-2">
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

        <ServerFormattedCodeSnippet
          code={tokenReferenceExample}
          language="css"
        />
      </DocSection>

      <DocSection
        title="Theme override tokens"
        description="A theme sets a role's color by writing --theme-{role} (or --theme-{role}-{shade} to pin a specific anchor). Natcore reads these seeds to derive every other token above. This is the only part of the token system you usually write by hand — the rest is generated."
      >
        <div className="grid gap-4">
          <ServerFormattedCodeSnippet
            code={overrideTokenExample}
            language="css"
          />
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
                Choose the role colors and schemes that give these tokens their
                values.
              </p>
            </div>
          </Link>

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
                See how a single color becomes a full ramp, and the classes you
                type to use these tokens.
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
                See how component classes consume these tokens.
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

function TokenFamilyCard({
  token,
  description,
  swatch,
}: {
  token: string;
  description: ReactNode;
  swatch: string;
}) {
  return (
    <div className="card card-soft/surface">
      <div data-slot="content" className="gap-3">
        <div className="flex items-center gap-3">
          <span
            className="block size-8 shrink-0 rounded-md border border-surface-600/20"
            style={{ backgroundColor: swatch }}
          />
          <InlineCode>{token}</InlineCode>
        </div>
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
