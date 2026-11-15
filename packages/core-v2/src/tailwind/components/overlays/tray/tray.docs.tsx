import { control, docsFor } from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import { uiAttr } from "@nataliebasille/preview-jsx-runtime/jsx-runtime";
import tray from "./tray.css.ts";

const { Page, Playground, Section, Example } = docsFor(tray);

const PLAYGROUND_TRAY_CLASSES = {
  left: "w-60 rounded-r-lg",
  right: "w-60 rounded-l-lg",
  top: "h-32 rounded-b-lg",
  bottom: "h-32 rounded-t-lg",
  inline: "order-1 w-60 shrink-0 rounded-lg",
} as const;

export default (
  <Page
    title="Tray"
    description="A positional disclosure surface that slides in from an edge or sits inline. Pick a direction variant, then open it with the open attribute, the tray-open utility, or a checked toggle slot."
    atAGlance={
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
        <TrayFrame>
          <div className="tray-left tray-open bg-surface-50 w-44 p-4 shadow-lg">
            <TrayContent title="Left tray" />
          </div>
        </TrayFrame>
        <TrayFrame>
          <div className="tray-bottom tray-open bg-surface-50 h-24 p-4 shadow-lg">
            <TrayContent title="Bottom tray" />
          </div>
        </TrayFrame>
      </div>
    }
  >
    <Playground
      controls={{
        variant: {
          label: "Direction",
          optionLabels: {
            left: "Left",
            right: "Right",
            top: "Top",
            bottom: "Bottom",
            inline: "Inline",
          },
        },
        open: control.boolean({
          default: true,
          label: "Initial state",
          offLabel: "Closed",
          onLabel: "Open",
        }),
      }}
      render={(v) => {
        const inline = v.variant === "inline";

        return (
          <ui-div
            className={
              inline ?
                "bg-surface-100/25 relative flex min-h-64 w-full gap-4 overflow-hidden rounded-xl p-4"
              : "bg-surface-100/25 relative h-64 w-full overflow-hidden rounded-xl"
            }
          >
            <div
              className={
                inline ? "order-2 min-w-0 flex-1 p-5" : "h-full min-w-0 p-5"
              }
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-on-surface-50 text-sm font-semibold">
                    Workspace
                  </p>
                  <p className="text-on-surface-50/60 text-xs">
                    {inline ?
                      "The tray sits inline beside this content."
                    : "The tray slides over this content from the selected edge."
                    }
                  </p>
                </div>

                <label
                  htmlFor="tray-playground-toggle"
                  className="btn-solid/primary btn-size-sm cursor-pointer"
                >
                  Toggle tray
                </label>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="bg-surface-200/70 h-3 w-1/2 rounded-full" />
                <div className="bg-surface-200/50 h-3 w-4/5 rounded-full" />
                <div className="bg-surface-200/40 h-3 w-2/3 rounded-full" />
              </div>
            </div>

            <aside
              className={`tray-${v.variant} ${PLAYGROUND_TRAY_CLASSES[v.variant]} bg-surface-50 p-5 shadow-xl`}
            >
              <input
                id="tray-playground-toggle"
                data-slot="toggle"
                type="checkbox"
                checked={v.open}
                {...uiAttr({ key: `${v.variant}-${v.open}` })}
              />
              <div className="flex h-full flex-col gap-4">
                <p className="text-on-surface-50 text-sm font-semibold">
                  Filters
                </p>
                <div className="text-on-surface-50/70 space-y-2 text-xs">
                  <div className="bg-surface-100/60 rounded-md px-3 py-2">
                    Navigation
                  </div>
                  <div className="bg-surface-100/60 rounded-md px-3 py-2">
                    Settings
                  </div>
                </div>
              </div>
            </aside>
          </ui-div>
        );
      }}
    />

    <Section
      of="tray"
      description="Positions the tray and applies the closed transform for the selected direction. The tray opens when it has the open attribute, the tray-open utility, or a checked toggle slot."
    >
      <Example
        title="Directions"
        description="Use tray-left, tray-right, tray-top, or tray-bottom for edge-mounted trays. Give side trays a width and top or bottom trays a height."
      >
        <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
          <TrayFrame label="tray-left">
            <div className="tray-left tray-open bg-surface-50 w-40 p-4 shadow-lg">
              <TrayContent title="Left" />
            </div>
          </TrayFrame>
          <TrayFrame label="tray-right">
            <div className="tray-right tray-open bg-surface-50 w-40 p-4 shadow-lg">
              <TrayContent title="Right" />
            </div>
          </TrayFrame>
          <TrayFrame label="tray-top">
            <div className="tray-top tray-open bg-surface-50 h-24 p-4 shadow-lg">
              <TrayContent title="Top" />
            </div>
          </TrayFrame>
          <TrayFrame label="tray-bottom">
            <div className="tray-bottom tray-open bg-surface-50 h-24 p-4 shadow-lg">
              <TrayContent title="Bottom" />
            </div>
          </TrayFrame>
        </ui-div>
      </Example>

      <Example
        title="Inline"
        description="Use tray-inline when the same markup should stay in normal document flow instead of sliding from an edge."
      >
        <ui-div className="border-surface-300/40 bg-surface-100/25 flex w-full gap-4 rounded-xl border p-4">
          <div className="tray-inline bg-surface-50 w-48 shrink-0 rounded-lg p-4 shadow-sm">
            <TrayContent title="Tray" />
          </div>
          <div className="bg-surface-50/45 min-w-0 flex-1 rounded-lg p-4">
            <p className="text-on-surface-50 text-sm font-semibold">Content</p>
            <p className="text-on-surface-50/60 mt-2 text-xs">
              The inline tray stays beside this content in normal document flow.
            </p>
          </div>
        </ui-div>
      </Example>

      <Example
        title="Open attribute"
        description="Use the native open attribute when the tray is a <details> element or is backed by disclosure state."
      >
        <TrayFrame label="open attribute">
          <details open className="tray-right bg-surface-50 w-44 p-4 shadow-lg">
            <summary className="sr-only">Open tray</summary>
            <TrayContent title="Open tray" />
          </details>
        </TrayFrame>
      </Example>
    </Section>

    <Section
      of="open"
      title="Open State"
      description="Forces the tray into its open position. Use it when JavaScript or server-rendered state controls visibility with classes."
    >
      <Example
        title="Open utility"
        description="Compose tray-open with any directional tray to skip the closed transform."
      >
        <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
          <TrayFrame label="closed">
            <div className="tray-left bg-surface-50 w-40 p-4 shadow-lg">
              <TrayContent title="Closed" />
            </div>
          </TrayFrame>
          <TrayFrame label="tray-open">
            <div className="tray-left tray-open bg-surface-50 w-40 p-4 shadow-lg">
              <TrayContent title="Open" />
            </div>
          </TrayFrame>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="@slots"
      title="Toggle Slot"
      description='Add data-slot="toggle" to a checkbox inside the tray to let its checked state open the tray, with no JavaScript. The tray hides the checkbox, so toggle it from a <label> elsewhere with a matching for.'
    >
      <Example title="CSS-only toggle">
        <TrayFrame label={'[data-slot="toggle"]:checked'}>
          <div className="tray-left bg-surface-50 w-44 p-4 shadow-lg">
            <input data-slot="toggle" type="checkbox" checked readOnly />
            <TrayContent title="Checked slot" />
          </div>
        </TrayFrame>
      </Example>
    </Section>
  </Page>
);

function TrayFrame({
  children,
  label,
}: {
  children?: ShowcaseJsxNode | ShowcaseJsxNode[];
  label?: string;
}) {
  return (
    <ui-div className="space-y-2">
      {label && (
        <ui>
          <span className="bg-surface-50/80 text-on-surface-50/70 inline-flex rounded px-2 py-1 font-mono text-xs">
            {label}
          </span>
        </ui>
      )}
      <ui-div className="border-surface-300/40 bg-surface-100/25 relative h-40 overflow-hidden rounded-xl border">
        {children}
      </ui-div>
    </ui-div>
  );
}

function TrayContent({ title }: { title: string }) {
  return (
    <div className="space-y-1">
      <p className="text-on-surface-50 text-sm font-semibold">{title}</p>
      <p className="text-on-surface-50/65 text-xs">
        Navigation, filters, or supporting content.
      </p>
    </div>
  );
}
