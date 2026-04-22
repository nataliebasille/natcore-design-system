/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

type CardVariant = "solid" | "soft" | "outline" | "ghost";
type CardTone = "primary" | "secondary" | "accent" | "surface";

const variantClasses: Record<CardVariant, Record<CardTone, string>> = {
  solid: {
    primary: "card-solid/primary",
    secondary: "card-solid/secondary",
    accent: "card-solid/accent",
    surface: "card-solid/surface",
  },
  soft: {
    primary: "card-soft/primary",
    secondary: "card-soft/secondary",
    accent: "card-soft/accent",
    surface: "card-soft/surface",
  },
  outline: {
    primary: "card-outline/primary",
    secondary: "card-outline/secondary",
    accent: "card-outline/accent",
    surface: "card-outline/surface",
  },
  ghost: {
    primary: "card-ghost/primary",
    secondary: "card-ghost/secondary",
    accent: "card-ghost/accent",
    surface: "card-ghost/surface",
  },
};

export function atAGlanceShowcase() {
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      {renderCard({
        className: "card-soft/primary",
        eyebrow: "Overview",
        title: "Structured content",
        body: "Add slot-marked children to apply the card section spacing automatically.",
        footer: "Header, content, and footer are documented slots.",
      })}
      {renderCard({
        className: "card-hover card-outline/accent",
        eyebrow: "Interactive",
        title: "Hover-ready card",
        body: "Compose card-hover with any variant when the whole surface should feel clickable.",
        footer: "card-hover + card-outline/accent",
      })}
    </ui-div>
  );
}

export function variantShowcase(variant: CardVariant) {
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      {renderCard({
        className: variantClasses[variant].primary,
        eyebrow: "Primary",
        title: `${capitalize(variant)} card`,
        body: "Use the primary palette for high-emphasis summaries, selections, or key navigation points.",
        footer: variantClasses[variant].primary,
      })}
      {renderCard({
        className: variantClasses[variant].secondary,
        eyebrow: "Secondary",
        title: "Supporting content",
        body: "Secondary works well for related panels or secondary summaries in a denser layout.",
        footer: variantClasses[variant].secondary,
      })}
      {renderCard({
        className: variantClasses[variant].accent,
        eyebrow: "Accent",
        title: "Highlight a state",
        body: "Accent cards are useful when you need a little more energy or a stronger semantic distinction.",
        footer: variantClasses[variant].accent,
      })}
      {renderCard({
        className: variantClasses[variant].surface,
        eyebrow: "Surface",
        title: "Low-noise layout",
        body: "Surface keeps the card present while preserving contrast for nested text and controls.",
        footer: variantClasses[variant].surface,
      })}
    </ui-div>
  );
}

export function slotShowcase() {
  return renderCard({
    className: "card-soft/secondary",
    eyebrow: "Layout",
    title: "Slot-based sections",
    body: "Mark child elements with data-slot attributes to opt into shared section padding and edge dividers.",
    footer: 'data-slot="header" | "content" | "footer"',
  });
}

export function hoverShowcase() {
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      {renderCard({
        className: "card-hover card-soft/primary",
        eyebrow: "Default state",
        title: "Interactive summary",
        body: "The hover utility animates background, foreground, border color, and scale together.",
        footer: "card-hover card-soft/primary",
      })}
      {renderCard({
        className: "card-hover card-ghost/surface",
        eyebrow: "Subtle",
        title: "Lightweight affordance",
        body: "Ghost cards stay quiet until pointer hover, which is useful for secondary navigation or preview rows.",
        footer: "card-hover card-ghost/surface",
      })}
    </ui-div>
  );
}

export function playgroundShowcase() {
  return (
    <ui-div className="lg:grid-cols-2 grid w-full gap-4">
      {renderCard({
        className: "card-soft/primary",
        eyebrow: "Soft",
        title: "Release summary",
        body: "Summarize the most important information in a sectioned container without adding extra wrapper utilities.",
        footer: "Updated 2 hours ago",
      })}
      {renderCard({
        className: "card-hover card-outline/accent",
        eyebrow: "Hover",
        title: "Clickable destination",
        body: "Compose card-hover with a variant class when the full card acts like a link, selection target, or drill-down entry.",
        footer: "Open details",
      })}
      {renderCard({
        className: "card-solid/secondary",
        eyebrow: "Solid",
        title: "Compact metric",
        body: "Solid cards are useful for denser dashboards where stronger contrast helps cards read as distinct modules.",
        footer: "24 active items",
      })}
      {renderCard({
        className: "card-ghost/surface",
        eyebrow: "Ghost",
        title: "Ambient grouping",
        body: "Ghost cards keep the grouping affordance while minimizing visual weight in supportive layouts.",
        footer: "Optional context",
      })}
    </ui-div>
  );
}

function renderCard({
  className,
  eyebrow,
  title,
  body,
  footer,
}: {
  className: string;
  eyebrow: string;
  title: string;
  body: string;
  footer: string;
}) {
  return (
    <article className={className}>
      <div data-slot="header" className="flex flex-col gap-1">
        <span className="text-xs tracking-[0.18em] uppercase opacity-70">
          {eyebrow}
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div data-slot="content" className="space-y-3 text-sm opacity-90">
        <p>{body}</p>
      </div>

      <div
        data-slot="footer"
        className="flex items-center justify-between gap-3 text-xs opacity-75"
      >
        <span>{footer}</span>
        <span>Preview</span>
      </div>
    </article>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
