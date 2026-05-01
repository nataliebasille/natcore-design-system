/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";

export default {
  title: "Tray",
  description:
    "A positional disclosure surface that slides in from an edge or participates inline. Use a direction variant, then open it with the open attribute, tray-open utility, or a checked toggle slot.",
  atAGlance: (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      <TrayFrame>
        <div className="tray-left w-44 tray-open bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Left tray" />
        </div>
      </TrayFrame>
      <TrayFrame>
        <div className="tray-bottom h-24 tray-open bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Bottom tray" />
        </div>
      </TrayFrame>
    </ui-div>
  ),
  components: {
    tray: {
      name: "Tray",
      description:
        "Positions the tray and applies the closed transform for the selected direction. The tray opens when it has the open attribute, the tray-open utility, or a checked toggle slot.",
      showcases: [
        {
          title: "Directions",
          description:
            "Use tray-left, tray-right, tray-top, or tray-bottom for edge-mounted trays. Give side trays a width and top or bottom trays a height from layout utilities.",
          content: directionShowcase(),
        },
        {
          title: "Inline",
          description:
            "Use tray-inline when the same markup should stay in normal document flow instead of sliding from an edge.",
          content: inlineShowcase(),
        },
      ],
    },
  },
  utilities: {
    open: {
      name: "Open State",
      description:
        "Forces the tray into its open transform. Use it when JavaScript or server-rendered state controls visibility with classes.",
      showcases: [
        {
          title: "Open utility",
          description:
            "Compose tray-open with any directional tray to bypass the closed transform.",
          content: openUtilityShowcase(),
        },
      ],
    },
  },
  sections: [
    {
      title: "Open Controls",
      description:
        "Trays can be opened by native attributes, utility classes, or a CSS-only checked input.",
      showcases: [
        {
          title: "Open attribute",
          description:
            "Use the native open attribute when the tray is backed by a disclosure or dialog-style state.",
          content: openAttributeShowcase(),
        },
        {
          title: "Checked toggle slot",
          description:
            'Place a checkbox inside the tray with data-slot="toggle"; when it is checked, the tray opens through :has().',
          content: toggleSlotShowcase(),
        },
      ],
    },
  ],
  slots: {
    title: "Toggle Slot",
    description:
      'Add data-slot="toggle" to a checkbox inside the tray to let native checked state control the open transform.',
    showcases: [
      {
        title: "CSS-only toggle",
        description:
          "The input can be visually hidden by the tray while an external label or control toggles it by id.",
        content: toggleSlotShowcase(),
      },
    ],
  },
} satisfies Documentation<
  typeof import("../../../../../packages/core-v2/src/tailwind/components/tray.css.ts").default
>;

function directionShowcase() {
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      <TrayFrame label="tray-left">
        <div className="tray-left w-40 tray-open bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Left" />
        </div>
      </TrayFrame>
      <TrayFrame label="tray-right">
        <div className="tray-right w-40 tray-open bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Right" />
        </div>
      </TrayFrame>
      <TrayFrame label="tray-top">
        <div className="tray-top h-24 tray-open bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Top" />
        </div>
      </TrayFrame>
      <TrayFrame label="tray-bottom">
        <div className="tray-bottom h-24 tray-open bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Bottom" />
        </div>
      </TrayFrame>
    </ui-div>
  );
}

function inlineShowcase() {
  return (
    <ui-div className="flex w-full gap-4 rounded-xl border border-surface-300/40 bg-surface-100/25 p-4">
      <div className="tray-inline w-48 shrink-0 rounded-lg bg-surface-50 p-4 shadow-sm">
        <div className="mb-3 font-mono text-xs text-on-surface-50/55">
          tray-inline
        </div>
        <TrayContent title="Tray" />
      </div>
      <div className="min-w-0 flex-1 rounded-lg bg-surface-50/45 p-4">
        <p className="text-sm font-semibold text-on-surface-50">Content</p>
        <p className="mt-2 text-xs text-on-surface-50/60">
          The inline tray stays beside this content in normal document flow.
        </p>
        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-3/4 rounded-full bg-surface-200/65" />
          <div className="h-2.5 w-1/2 rounded-full bg-surface-200/45" />
        </div>
      </div>
    </ui-div>
  );
}

function openUtilityShowcase() {
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      <TrayFrame label="closed">
        <div className="tray-left w-40 bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Closed" />
        </div>
      </TrayFrame>
      <TrayFrame label="tray-open">
        <div className="tray-left w-40 tray-open bg-surface-50 p-4 shadow-lg">
          <TrayContent title="Open" />
        </div>
      </TrayFrame>
    </ui-div>
  );
}

function openAttributeShowcase() {
  return (
    <TrayFrame label="open attribute">
      <details open className="tray-right w-44 bg-surface-50 p-4 shadow-lg">
        <summary className="sr-only">Open tray</summary>
        <TrayContent title="Open tray" />
      </details>
    </TrayFrame>
  );
}

function toggleSlotShowcase() {
  return (
    <TrayFrame label='[data-slot="toggle"]:checked'>
      <div className="tray-left w-44 bg-surface-50 p-4 shadow-lg">
        <input data-slot="toggle" type="checkbox" checked readOnly />
        <TrayContent title="Checked slot" />
      </div>
    </TrayFrame>
  );
}

function TrayFrame({
  children,
  label,
}: {
  children: ShowcaseJsxNode;
  label?: string;
}) {
  return (
    <ui-div className="space-y-2">
      {label && (
        <span className="inline-flex rounded bg-surface-50/80 px-2 py-1 font-mono text-xs text-on-surface-50/70">
          {label}
        </span>
      )}
      <ui-div className="relative h-40 overflow-hidden rounded-xl border border-surface-300/40 bg-surface-100/25">
        {children}
      </ui-div>
    </ui-div>
  );
}

function TrayContent({ title }: { title: string }) {
  return (
    <ui-div className="space-y-1">
      <p className="text-sm font-semibold text-on-surface-50">{title}</p>
      <p className="text-xs text-on-surface-50/65">
        Navigation, filters, or supporting content.
      </p>
    </ui-div>
  );
}
