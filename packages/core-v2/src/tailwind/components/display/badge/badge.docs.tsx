import { control, docsFor } from "@nataliebasille/css-engine";
import badge from "./badge.css.ts";

const { Page, Playground, Section, Example } = docsFor(badge);

export default (
  <Page
    title="Badge"
    description="Compact status labels for tags, counts, and inline metadata. Pick a variant and palette, then drop the badge alongside other UI without extra setup."
    atAGlance={
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-solid/primary">New</span>
        <span className="badge-soft/secondary">Beta</span>
        <span className="badge-outline/accent">Draft</span>
        <span className="badge-ghost/surface">Muted</span>
      </div>
    }
  >
    <Playground
      controls={{
        palette: control.palette(["primary", "secondary", "accent", "surface"]),
        label: control.text("Active"),
      }}
      render={(v) => (
        <ui-div className="border-surface-300/50 bg-surface-50 text-on-surface-50/70 flex w-full flex-wrap items-center gap-3 rounded-2xl border p-4 text-sm">
          <span>Release 2.3.0</span>
          <span className={`badge-${v.variant}/${v.palette}`}>
            {v.label.trim() || "Badge"}
          </span>
          <span>ready for rollout</span>
        </ui-div>
      )}
    />

    <Section
      of="badge"
      description="Applies compact pill styling using the selected variant and tone palette."
    >
      <Example title="Solid">
        <ui-div className="flex w-full flex-wrap items-center gap-3">
          <span className="badge-solid/primary">Primary</span>
          <span className="badge-solid/secondary">Secondary</span>
          <span className="badge-solid/accent">Accent</span>
          <span className="badge-solid/surface">Surface</span>
        </ui-div>
      </Example>

      <Example title="Soft">
        <ui-div className="flex w-full flex-wrap items-center gap-3">
          <span className="badge-soft/primary">Primary</span>
          <span className="badge-soft/secondary">Secondary</span>
          <span className="badge-soft/accent">Accent</span>
          <span className="badge-soft/surface">Surface</span>
        </ui-div>
      </Example>

      <Example title="Outline">
        <ui-div className="flex w-full flex-wrap items-center gap-3">
          <span className="badge-outline/primary">Primary</span>
          <span className="badge-outline/secondary">Secondary</span>
          <span className="badge-outline/accent">Accent</span>
          <span className="badge-outline/surface">Surface</span>
        </ui-div>
      </Example>

      <Example title="Ghost">
        <ui-div className="flex w-full flex-wrap items-center gap-3">
          <span className="badge-ghost/primary">Primary</span>
          <span className="badge-ghost/secondary">Secondary</span>
          <span className="badge-ghost/accent">Accent</span>
          <span className="badge-ghost/surface">Surface</span>
        </ui-div>
      </Example>
    </Section>
  </Page>
);
