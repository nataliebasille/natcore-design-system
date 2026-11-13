import { control, docsFor } from "@nataliebasille/css-engine";
import divider from "./divider.css.ts";

const { Page, Playground, Section, Example } = docsFor(divider);

// Written out so Tailwind's source scan generates every playground class.
const DIVIDER_CLASSES = {
  horizontal: {
    primary: "divider/primary",
    secondary: "divider/secondary",
    accent: "divider/accent",
    surface: "divider/surface",
    success: "divider/success",
    danger: "divider/danger",
    disabled: "divider/disabled",
  },
  vertical: {
    primary: "divider-v/primary",
    secondary: "divider-v/secondary",
    accent: "divider-v/accent",
    surface: "divider-v/surface",
    success: "divider-v/success",
    danger: "divider-v/danger",
    disabled: "divider-v/disabled",
  },
} as const;

const PLACEMENT_CLASSES = {
  start: "divider-place-content-start",
  "25%": "divider-place-content-25%",
  center: "divider-place-content-center",
  "[33%]": "divider-place-content-[33%]",
  end: "divider-place-content-end",
} as const;

export default (
  <Page
    title="Divider"
    description="Flexible separators for splitting content horizontally or vertically. Add optional label content, switch orientation with the v variant, and move the label with the placement utility."
    atAGlance={
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
        <div className="space-y-2">
          <p className="text-sm opacity-75">Section header</p>
          <div className="divider/primary">Overview</div>
          <p className="text-sm opacity-75">
            Supporting content continues below.
          </p>
        </div>

        <div className="flex h-32 items-center justify-center gap-4">
          <span className="text-sm opacity-75">Left</span>
          <div className="divider-v/secondary h-full">OR</div>
          <span className="text-sm opacity-75">Right</span>
        </div>
      </div>
    }
  >
    <Playground
      controls={{
        variant: false,
        "place-content": false,
        direction: control.select(["horizontal", "vertical"], {
          optionLabels: { horizontal: "Horizontal", vertical: "Vertical" },
        }),
        palette: control.palette(),
        placement: control.select(["start", "25%", "center", "[33%]", "end"], {
          default: "center",
          optionLabels: {
            start: "Start",
            "25%": "25%",
            center: "Center",
            "[33%]": "33% (arbitrary)",
            end: "End",
          },
        }),
        label: control.text("Overview"),
      }}
      render={(v) => {
        const className = `${DIVIDER_CLASSES[v.direction][v.palette]} ${PLACEMENT_CLASSES[v.placement]}`;

        return v.direction === "vertical" ?
            <ui-div className="bg-surface-50 flex h-28 w-full items-center justify-center gap-4 rounded-2xl px-4">
              <span className="text-sm opacity-75">Account</span>
              <div className={`${className} h-24 shrink-0`}>{v.label}</div>
              <span className="text-sm opacity-75">Billing</span>
            </ui-div>
          : <ui-div className="bg-surface-50 w-full space-y-3 rounded-2xl p-4">
              <div className="space-y-1">
                <p className="text-sm opacity-75">Current release</p>
                <p className="text-lg font-semibold">Natcore v2 preview</p>
              </div>
              <div className={className}>{v.label}</div>
              <p className="text-sm opacity-75">
                Swap direction, palette, and placement to see the divider
                classes change.
              </p>
            </ui-div>;
      }}
    />

    <Section
      of="divider"
      description="Renders a horizontal divider line with an optional tone palette modifier and optional label content."
      vars={{
        "--gap":
          "Spacing between the label and the divider lines. The default is 0.5rem (2).",
      }}
    >
      <Example
        title="Horizontal"
        description="Use the base divider class between stacked sections when you need a visual break, with or without text."
      >
        <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
          <div className="space-y-2">
            <span className="text-sm opacity-75">Without label</span>
            <div className="divider/surface"></div>
          </div>

          <div className="space-y-2">
            <span className="text-sm opacity-75">With label</span>
            <div className="divider/accent">Status</div>
          </div>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="divider@variant"
      title="Vertical Divider"
      description="The v variant turns the divider into a vertical separator with the same palette and label behavior."
    >
      <Example
        title="Vertical"
        description="Use divider-v inside a flex row and give it height from the layout or a utility like h-24."
      >
        <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
          <div className="bg-surface-50 flex h-28 items-center justify-center gap-4 rounded-2xl px-4">
            <span className="text-sm opacity-75">Left pane</span>
            <div className="divider-v/primary h-full"></div>
            <span className="text-sm opacity-75">Right pane</span>
          </div>

          <div className="bg-surface-50 flex h-28 items-center justify-center gap-4 rounded-2xl px-4">
            <span className="text-sm opacity-75">Choice A</span>
            <div className="divider-v/success h-full">OR</div>
            <span className="text-sm opacity-75">Choice B</span>
          </div>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="place-content"
      title="Content Placement"
      description="Moves the label toward the start, center, or end of the line. Works with either orientation."
    >
      <Example title="Named placements">
        <ui-div className="flex w-full flex-col gap-4">
          <div className="divider/primary divider-place-content-start">
            Start aligned
          </div>
          <div className="divider/secondary divider-place-content-center">
            Center aligned
          </div>
          <div className="divider/accent divider-place-content-end">
            End aligned
          </div>
        </ui-div>
      </Example>

      <Example
        title="Percentages"
        description="Pass a percentage, bare or in square brackets, to place the label anywhere along the line."
      >
        <ui-div className="flex w-full flex-col gap-4">
          <div className="divider/primary divider-place-content-25%">25%</div>
          <div className="divider/primary divider-place-content-[33%]">33%</div>
        </ui-div>
      </Example>
    </Section>
  </Page>
);
