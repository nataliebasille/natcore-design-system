import { docs, PALETTE, type Palette } from "@nataliebasille/css-engine";

const { Page, Section } = docs();

// Literal class strings so Tailwind detects and generates them.
const SWATCH_CLASSES: Record<Palette, string> = {
  primary: "bg-primary-500",
  secondary: "bg-secondary-500",
  accent: "bg-accent-500",
  surface: "bg-surface-500",
  success: "bg-success-500",
  danger: "bg-danger-500",
  disabled: "bg-disabled-500",
};

export default (
  <Page
    title="Natcore Design System"
    description="A CSS-first design system built to survive different stacks. Tokens, utilities, and component styles are applied through class names. If your product renders HTML, Natcore can style it."
    nav={{
      label: "Introduction",
      group: "Getting Started",
      order: 0,
      path: "/",
    }}
  >
    <Section title="Start here">
      <div className="card-outline/surface">
        <div data-slot="content" className="gap-4">
          <p className="text-surface-950/65 text-sm/7">
            Install the package, import one stylesheet, then compose UI with the
            same class language this documentation uses.
          </p>
          <a
            href="/installation"
            className="btn-outline btn-size-sm flex w-fit items-center gap-2"
          >
            Installation guide →
          </a>
        </div>
      </div>
    </Section>

    <Section title="Principles">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3">
        <InfoCard
          label="01"
          title="Stack agnostic"
          description="The core is CSS. If your product renders HTML, Natcore can style it."
        />
        <InfoCard
          label="02"
          title="Composable"
          description="Build UI by composing utilities and tokens, not one-off custom CSS."
        />
        <InfoCard
          label="03"
          title="Consistent"
          description="Modifiers express intent. Scan markup and understand it without reading implementation."
        />
        <InfoCard
          label="04"
          title="Themeable"
          description="Same HTML renders under any theme. Switch with a single data attribute."
        />
      </div>
    </Section>

    <Section title="Explore">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        <a href="/core/tokens" className="card-hover card-soft/surface">
          <ExploreCard
            title="Tokens"
            description="Color, spacing, typography, radii, shadow, and motion as CSS variables"
            linked
          />
        </a>
        <a href="/components/button" className="card-hover card-soft/surface">
          <ExploreCard
            title="Components"
            description="Everything you need to build consistent interfaces"
            linked
          />
        </a>
        <div className="card-soft/surface">
          <ExploreCard
            title="Guidelines"
            description="Variants, tones, naming conventions, and theming rules"
          />
        </div>
      </div>
    </Section>

    <Section title="Core tokens">
      <div className="flex flex-wrap gap-3">
        {PALETTE.map((color) => (
          <div className="badge-soft/surface flex items-center rounded-lg px-3 py-1.5">
            <span
              className={[
                SWATCH_CLASSES[color],
                "mr-2 inline-block h-3 w-3 rounded-sm",
              ].join(" ")}
            ></span>
            {color}
          </div>
        ))}
      </div>
    </Section>
  </Page>
);

function InfoCard({
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
      <div data-slot="content" className="flex flex-col gap-2">
        <span className="flex items-center gap-2">
          <span className="bg-surface-50 text-on-surface-50 inline-flex aspect-square size-7 items-center justify-center rounded-md text-xs">
            {label}
          </span>
          {title}
        </span>
        <span className="flex-1 text-xs/relaxed text-(--tone-current-fg)/70">
          {description}
        </span>
      </div>
    </div>
  );
}

function ExploreCard({
  title,
  description,
  linked = false,
}: {
  title: string;
  description: string;
  linked?: boolean;
}) {
  return (
    <div data-slot="content" className="flex flex-col gap-2">
      <span>{title}</span>
      <span className="flex-1 text-xs/relaxed text-(--tone-current-fg)/70">
        {description}
      </span>
      {linked && (
        <span className="mt-4 text-xs tracking-wider uppercase">Explore →</span>
      )}
    </div>
  );
}
