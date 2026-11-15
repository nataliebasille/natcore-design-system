import { control, docsFor } from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import card from "./card.css.ts";

const { Page, Playground, Section, Example } = docsFor(card);

export default (
  <Page
    title="Card"
    description="Sectioned content containers with variant-driven tone styling and an optional hover modifier. Mark child sections with data-slot attributes to get the card's section layout."
    atAGlance={
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
        <DemoCard
          className="card-soft/primary"
          eyebrow="Overview"
          title="Structured content"
          body="Add slot-marked children to get the card section spacing automatically."
          footer="Header, content, and footer are slots."
        />
        <DemoCard
          className="card-hover card-outline/accent"
          eyebrow="Interactive"
          title="Hover-ready card"
          body="Compose card-hover with any variant when the whole surface should feel clickable."
          footer="card-hover card-outline/accent"
        />
      </div>
    }
  >
    <Playground
      controls={{
        variant: { default: "soft" },
        palette: control.palette(["primary", "secondary", "accent", "surface"]),
        hover: control.boolean({ label: "Hover" }),
        footer: control.boolean({
          default: true,
          label: "Footer",
          offLabel: "Hidden",
          onLabel: "Shown",
        }),
        title: control.text("Release summary"),
      }}
      render={(v) => (
        <article
          className={[
            `card-${v.variant}/${v.palette}`,
            v.hover ? "card-hover" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div data-slot="header" className="flex flex-col gap-1">
            <span className="text-xs tracking-[0.18em] uppercase opacity-70">
              Interactive
            </span>
            <h3 className="text-lg font-semibold">{v.title}</h3>
          </div>

          <div data-slot="content" className="space-y-3 text-sm opacity-90">
            <p>
              Switch variants, palettes, and hover behavior to see how the card
              surface and its markup change together.
            </p>
          </div>

          {v.footer && (
            <div
              data-slot="footer"
              className="flex items-center justify-between gap-3 text-xs opacity-75"
            >
              <span>{v.hover ? "Hover enabled" : "Hover disabled"}</span>
              <span>{`card-${v.variant}/${v.palette}`}</span>
            </div>
          )}
        </article>
      )}
    />

    <Section
      of="card"
      description="Applies the card container styling using the selected variant and tone palette. Child sections opt into the built-in layout with slots."
    >
      <Example title="Solid">
        <VariantGrid>
          <PrimaryCard className="card-solid/primary" />
          <SecondaryCard className="card-solid/secondary" />
          <AccentCard className="card-solid/accent" />
          <SurfaceCard className="card-solid/surface" />
        </VariantGrid>
      </Example>

      <Example title="Soft">
        <VariantGrid>
          <PrimaryCard className="card-soft/primary" />
          <SecondaryCard className="card-soft/secondary" />
          <AccentCard className="card-soft/accent" />
          <SurfaceCard className="card-soft/surface" />
        </VariantGrid>
      </Example>

      <Example title="Outline">
        <VariantGrid>
          <PrimaryCard className="card-outline/primary" />
          <SecondaryCard className="card-outline/secondary" />
          <AccentCard className="card-outline/accent" />
          <SurfaceCard className="card-outline/surface" />
        </VariantGrid>
      </Example>

      <Example title="Ghost">
        <VariantGrid>
          <PrimaryCard className="card-ghost/primary" />
          <SecondaryCard className="card-ghost/secondary" />
          <AccentCard className="card-ghost/accent" />
          <SurfaceCard className="card-ghost/surface" />
        </VariantGrid>
      </Example>
    </Section>

    <Section
      of="hover"
      title="Hover Modifier"
      description="Adds an interactive hover treatment by animating background, foreground, border color, and scale. Compose it with any card variant."
    >
      <Example
        title="Composed with variants"
        description="Use card-hover alongside a variant class when the entire card surface should feel clickable."
      >
        <VariantGrid>
          <DemoCard
            className="card-hover card-soft/primary"
            eyebrow="Default state"
            title="Interactive summary"
            body="The hover utility animates background, foreground, border color, and scale together."
            footer="card-hover card-soft/primary"
          />
          <DemoCard
            className="card-hover card-ghost/surface"
            eyebrow="Subtle"
            title="Lightweight affordance"
            body="Ghost cards stay quiet until hovered, which suits secondary navigation or preview rows."
            footer="card-hover card-ghost/surface"
          />
        </VariantGrid>
      </Example>
    </Section>

    <Section
      of="@slots"
      title="Card Slots"
      description='Add data-slot="header", data-slot="content", and data-slot="footer" to direct children to get the card section spacing and dividers.'
    >
      <Example title="Structured content">
        <DemoCard
          className="card-soft/secondary"
          eyebrow="Layout"
          title="Slot-based sections"
          body="Mark child elements with data-slot attributes to opt into shared section padding and edge dividers."
          footer={'data-slot="header" | "content" | "footer"'}
        />
      </Example>
    </Section>
  </Page>
);

function VariantGrid({
  children,
}: {
  children?: ShowcaseJsxNode | ShowcaseJsxNode[];
}) {
  return (
    <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
      {children}
    </ui-div>
  );
}

function PrimaryCard({ className }: { className: string }) {
  return (
    <DemoCard
      className={className}
      eyebrow="Primary"
      title="Key summary"
      body="Use the primary palette for high-emphasis summaries, selections, or key navigation points."
      footer={className}
    />
  );
}

function SecondaryCard({ className }: { className: string }) {
  return (
    <DemoCard
      className={className}
      eyebrow="Secondary"
      title="Supporting content"
      body="Secondary works well for related panels or secondary summaries in a denser layout."
      footer={className}
    />
  );
}

function AccentCard({ className }: { className: string }) {
  return (
    <DemoCard
      className={className}
      eyebrow="Accent"
      title="Highlight a state"
      body="Accent cards help when you need more energy or a stronger semantic distinction."
      footer={className}
    />
  );
}

function SurfaceCard({ className }: { className: string }) {
  return (
    <DemoCard
      className={className}
      eyebrow="Surface"
      title="Low-noise layout"
      body="Surface keeps the card present while preserving contrast for nested text and controls."
      footer={className}
    />
  );
}

function DemoCard({
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
