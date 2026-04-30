/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

export default {
  title: "Divider",
  description:
    "Flexible separators for splitting content horizontally or vertically. Add optional label content, switch orientation with the v variant, and adjust where the label sits with the placement utility.",
  atAGlance: (
    <ui-div className="md:grid-cols-[minmax(0,1fr)_auto] grid w-full gap-4">
      <ui-div className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm opacity-75">Section header</p>
          <div className="divider/primary">Overview</div>
          <p className="text-sm opacity-75">
            Supporting content continues below.
          </p>
        </div>
      </ui-div>

      <ui-div className="flex h-32 items-center justify-center gap-4">
        <span className="text-sm opacity-75">Left</span>
        <div className="divider-v/secondary h-full">OR</div>
        <span className="text-sm opacity-75">Right</span>
      </ui-div>
    </ui-div>
  ),
  components: {
    divider: {
      name: "Divider",
      description:
        "Renders a horizontal divider line with an optional tone palette modifier and optional inline label content.",
      showcases: [
        {
          title: "Horizontal",
          description:
            "Use the base divider class between stacked sections when you need a simple visual break with or without text.",
          content: horizontalShowcase(),
        },
      ],
    },
    "divider@variant": {
      name: "Vertical Divider",
      description:
        "Adds the v variant to rotate the divider into a vertical separator while keeping the same palette and content behavior.",
      showcases: [
        {
          title: "Vertical",
          description:
            "Use divider-v inside a flex row and give it height from the layout or a utility like h-24.",
          content: verticalShowcase(),
        },
      ],
    },
  },
  utilities: {
    "place-content": {
      name: "Content Placement",
      description:
        "Moves the divider label toward the start, center, or end of the available line space. Accepts named tokens or arbitrary percentages.",
    },
  },
  sections: [
    {
      title: "Placement Utility",
      description:
        "Compose divider-place-content-* with either orientation when the default centered label needs to align with surrounding content.",
      showcases: [
        {
          title: "Named placements",
          content: placementShowcase(),
        },
      ],
    },
  ],
} satisfies Documentation<
  typeof import("../../../../../packages/core-v2/src/tailwind/components/divider.css.ts").default
>;

function horizontalShowcase() {
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      <div className="space-y-2">
        <span className="text-sm opacity-75">Without label</span>
        <div className="divider/surface"></div>
      </div>

      <div className="space-y-2">
        <span className="text-sm opacity-75">With label</span>
        <div className="divider/accent">Status</div>
      </div>
    </ui-div>
  );
}

function verticalShowcase() {
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      <div className="bg-surface/40 flex h-28 items-center justify-center gap-4 rounded-2xl px-4">
        <span className="text-sm opacity-75">Left pane</span>
        <div className="divider-v/primary h-full"></div>
        <span className="text-sm opacity-75">Right pane</span>
      </div>

      <div className="bg-surface/40 flex h-28 items-center justify-center gap-4 rounded-2xl px-4">
        <span className="text-sm opacity-75">Choice A</span>
        <div className="divider-v/success h-full">OR</div>
        <span className="text-sm opacity-75">Choice B</span>
      </div>
    </ui-div>
  );
}

function placementShowcase() {
  return (
    <ui-div className="flex w-full flex-col gap-4">
      <div className="divider-place-content-before-start divider/primary">
        Start aligned
      </div>
      <div className="divider-place-content-before-center divider/secondary">
        Center aligned
      </div>
      <div className="divider-place-content-before-end divider/accent">
        End aligned
      </div>
    </ui-div>
  );
}
