import { control, docsFor } from "@nataliebasille/css-engine";
import popover from "./popover.css.ts";

const { Page, Playground, Section, Example } = docsFor(popover);

const SUPPORT_ANCHORING =
  "Popovers are placed with CSS anchor positioning: Chrome and Edge 125+, Safari 26+, and Firefox 147+. Older browsers still open and close them, but not next to their trigger.";

const SUPPORT_INVOKERS =
  "commandfor works in Chrome and Edge 135+, Firefox 144+, and Safari 26.2+. popovertarget does the same in every browser with popover support.";

const SUPPORT_INTEREST =
  "interestfor works in Chrome and Edge 142+. Other browsers ignore it unless you load the interestfor polyfill; for no JavaScript at all, use a wrapper with popover-trigger-hover instead.";

const DELAY_CLASSES = {
  default: "",
  none: " popover-trigger-delay-0",
  slow: " popover-trigger-delay-1000",
} as const;

const TRIGGER_LABELS = {
  click: "Click to open",
  interest: "Hover or focus to open",
  hover: "Hover to open",
  focus: "Tab to or click to open",
  checked: "Click to toggle",
} as const;

export default (
  <Page
    title="Popover"
    description="Positions floating content next to the element that opens it, with no JavaScript. Open it natively with commandfor or interestfor, or put the trigger and the popover in a popover-anchor wrapper and pick how CSS opens it: hover, focus, or a checkbox. The popover adds no surface of its own, so pair it with card classes."
    atAGlance={
      <div className="flex w-full flex-wrap items-center justify-center gap-16 py-4">
        <span className="popover-anchor">
          <label className="popover-trigger-checked btn-solid/primary">
            <input type="checkbox" className="sr-only" />
            Click for menu
          </label>
          <div
            data-slot="popover"
            className="popover card-soft w-44 p-1 text-sm"
          >
            <MenuItems />
          </div>
        </span>
        <span className="popover-anchor">
          <button className="popover-trigger-hover btn-outline/surface">
            Hover for tooltip
          </button>
          <div
            data-slot="popover"
            className="popover-right card-solid px-2 py-1 text-xs"
          >
            Move to trash
          </div>
        </span>
      </div>
    }
  >
    <Playground
      controls={{
        trigger: control.select(
          ["click", "interest", "hover", "focus", "checked"],
          {
            default: "hover",
            optionLabels: {
              click: "Click (commandfor)",
              interest: "Hover or focus (interestfor)",
              hover: "Hover (CSS)",
              focus: "Focus (CSS)",
              checked: "Checkbox (CSS)",
            },
          },
        ),
        variant: {
          label: "Placement",
          default: "bottom",
          optionLabels: {
            top: "Top",
            "top-start": "Top start",
            "top-end": "Top end",
            bottom: "Bottom",
            "bottom-start": "Bottom start",
            "bottom-end": "Bottom end",
            left: "Left",
            "left-start": "Left start",
            "left-end": "Left end",
            right: "Right",
            "right-start": "Right start",
            "right-end": "Right end",
          },
        },
        flip: control.boolean({
          label: "Flip near an edge",
          offLabel: "Off",
          onLabel: "On (popover-flip)",
        }),
        delay: control.select(["default", "none", "slow"], {
          label: "Hover and focus delay",
          optionLabels: {
            default: "Default (0.5s open, 0.25s close)",
            none: "None (popover-trigger-delay-0)",
            slow: "1s (popover-trigger-delay-1000)",
          },
        }),
      }}
      render={(v) => {
        const popoverClassName = `popover-${v.variant}${v.flip ? " popover-flip" : ""} card-soft w-56 p-3 text-sm`;
        const delay = DELAY_CLASSES[v.delay];
        const label = TRIGGER_LABELS[v.trigger];

        if (v.trigger === "click") {
          return (
            <>
              <button
                className="btn-solid/primary"
                commandfor="popover-playground"
                command="toggle-popover"
              >
                {label}
              </button>
              <div
                id="popover-playground"
                popover="auto"
                className={popoverClassName}
              >
                <ShareText />
              </div>
            </>
          );
        }

        if (v.trigger === "interest") {
          return (
            <>
              <button
                className={`btn-solid/primary${delay}`}
                interestfor="popover-playground"
              >
                {label}
              </button>
              <div
                id="popover-playground"
                popover="hint"
                className={popoverClassName}
              >
                <ShareText />
              </div>
            </>
          );
        }

        return (
          <span className="popover-anchor">
            {v.trigger === "checked" ?
              <label className="popover-trigger-checked btn-solid/primary">
                <input type="checkbox" className="sr-only" />
                {label}
              </label>
            : <button
                className={`btn-solid/primary ${v.trigger === "hover" ? "popover-trigger-hover" : "popover-trigger-focus"}${delay}`}
              >
                {label}
              </button>
            }
            <div data-slot="popover" className={popoverClassName}>
              <ShareText />
            </div>
          </span>
        );
      }}
    />

    <Section
      of="popover"
      description="Put popover on the floating element. Opened natively, it sits below the button that opened it, 0.5rem away, centered. It stays below even near the edge of the screen; add popover-flip to let it flip. It fades in and out and stays above overflow: hidden containers. Use it with the native popover attribute and a button that opens it."
    >
      <Example
        title="Click"
        description='A button with commandfor and command="toggle-popover" opens and closes the popover. Clicking outside or pressing Esc closes it too.'
        table={[
          {
            label: "commandfor",
            content: (
              <span>
                The <code className="code-inline">id</code> of the popover the
                button controls, with{" "}
                <code className="code-inline">command</code> set to{" "}
                <code className="code-inline">toggle-popover</code>,{" "}
                <code className="code-inline">show-popover</code>, or{" "}
                <code className="code-inline">hide-popover</code>.
              </span>
            ),
          },
          {
            label: "popovertarget",
            content: (
              <span>
                The older attribute for the same thing:{" "}
                <code className="code-inline">
                  popovertarget=&quot;popover-click&quot;
                </code>{" "}
                on the button toggles the popover.
              </span>
            ),
          },
          {
            label: "Placement",
            content:
              "The popover is placed against the button that opened it. Nothing else connects them.",
          },
          { label: "Browser support", content: SUPPORT_INVOKERS },
        ]}
      >
        <button
          className="btn-solid/primary"
          commandfor="popover-click"
          command="toggle-popover"
        >
          Click to open
        </button>
        <div
          id="popover-click"
          popover="auto"
          className="popover card-soft w-56 p-3 text-sm"
        >
          <ShareText />
        </div>
      </Example>

      <Example
        title="Tooltip"
        description='interestfor opens the popover when the button is hovered or focused, after a short delay, and closes it when the pointer or focus leaves. popover="hint" keeps it from closing other popovers.'
        table={[
          {
            label: "interestfor",
            content: (
              <span>
                The <code className="code-inline">id</code> of the popover. The
                browser shows it after 0.5s of hover or focus and hides it 0.25s
                after interest is lost; change that with{" "}
                <code className="code-inline">
                  popover-trigger-delay-{"{value}"}
                </code>{" "}
                on the button, for example{" "}
                <code className="code-inline">popover-trigger-delay-300</code>.
              </span>
            ),
          },
          { label: "Browser support", content: SUPPORT_INTEREST },
        ]}
      >
        <button className="btn-outline/surface" interestfor="popover-tooltip">
          Hover or focus to open
        </button>
        <div
          id="popover-tooltip"
          popover="hint"
          className="popover-top card-solid px-2 py-1 text-xs"
        >
          Opens on hover or focus
        </div>
      </Example>
    </Section>

    <Section
      of="popover@variant"
      title="Placement"
      description="popover-{side}, popover-{side}-start, and popover-{side}-end are complete popovers on that side of the trigger; use one instead of popover. Start and end line the popover up with the trigger's edges. A placement stays on its side even near the edge of the screen, unless the popover also has popover-flip."
    >
      <Example title="Below">
        <ui-div className="flex flex-wrap items-center justify-center gap-3 py-2">
          <PlacementExample cls="popover-bottom-start" label="Click: Start" />
          <PlacementExample cls="popover-bottom" label="Click: Center" />
          <PlacementExample cls="popover-bottom-end" label="Click: End" />
        </ui-div>
      </Example>

      <Example title="Above">
        <ui-div className="flex flex-wrap items-center justify-center gap-3 py-2">
          <PlacementExample cls="popover-top-start" label="Click: Start" />
          <PlacementExample cls="popover-top" label="Click: Center" />
          <PlacementExample cls="popover-top-end" label="Click: End" />
        </ui-div>
      </Example>

      <Example title="Left">
        <ui-div className="flex flex-col items-center gap-3 py-2">
          <PlacementExample cls="popover-left-start" label="Click: Start" />
          <PlacementExample cls="popover-left" label="Click: Center" />
          <PlacementExample cls="popover-left-end" label="Click: End" />
        </ui-div>
      </Example>

      <Example title="Right">
        <ui-div className="flex flex-col items-center gap-3 py-2">
          <PlacementExample cls="popover-right-start" label="Click: Start" />
          <PlacementExample cls="popover-right" label="Click: Center" />
          <PlacementExample cls="popover-right-end" label="Click: End" />
        </ui-div>
      </Example>

      <Example
        title="Responsive"
        description="Placements combine with responsive variants: popover-bottom min-[48rem]:popover-right is below the trigger on narrow screens and beside it from 48rem up. Breakpoint variants from your theme, such as md:, work the same way."
      >
        <button
          className="btn-solid/primary"
          commandfor="popover-responsive"
          command="toggle-popover"
        >
          Click to open
        </button>
        <div
          id="popover-responsive"
          popover="auto"
          className="popover-bottom card-soft min-[48rem]:popover-right w-48 p-3 text-sm"
        >
          Resize the window to move me.
        </div>
      </Example>
    </Section>

    <Section
      of="anchor"
      title="Wrapper"
      description='Put popover-anchor on an element around a trigger and a popover marked data-slot="popover". The popover is placed against the wrapper and opened by CSS, so it works in every browser with no JavaScript. Choose how it opens with popover-trigger-hover, popover-trigger-focus, or popover-trigger-checked on the trigger. An open <details class="popover-anchor"> shows its popover too.'
    >
      <Example
        title="Details"
        description="A <details> wrapper opens and closes on each click of its <summary>, with keyboard support built in."
        table={[
          {
            label: 'data-slot="popover"',
            content:
              "Marks the popover. It must be a direct child of the wrapper; everything else in the wrapper is the trigger side.",
          },
          {
            label: "Top layer",
            content:
              "A popover opened by CSS isn't in the top layer. It has z-index: 50, so it stays above later content in the same stacking context; change it with a z-index utility like z-10. It is position: fixed, so overflow: hidden ancestors don't clip it, unless an ancestor has a transform or filter.",
          },
          { label: "Browser support", content: SUPPORT_ANCHORING },
        ]}
      >
        <details className="popover-anchor">
          <summary className="btn-outline/surface list-none">
            Click to open
          </summary>
          <div
            data-slot="popover"
            className="popover card-soft w-44 p-1 text-sm"
          >
            <MenuItems />
          </div>
        </details>
      </Example>
    </Section>

    <Section
      of="trigger-hover"
      title="Hover Trigger"
      description="Opens the wrapper's popover while the trigger is hovered, after 0.5s, and closes it 0.25s after the pointer leaves the wrapper. The popover stays open while the pointer moves onto it."
    >
      <Example title="Tooltip">
        <span className="popover-anchor">
          <button className="popover-trigger-hover btn-outline/surface">
            Hover to open
          </button>
          <div
            data-slot="popover"
            className="popover-top card-solid px-2 py-1 text-xs"
          >
            Works in every browser
          </div>
        </span>
      </Example>
    </Section>

    <Section
      of="trigger-focus"
      title="Focus Trigger"
      description="Opens the popover while the trigger or anything in the popover has focus. Keyboard focus waits for the open delay, like interestfor; a click opens it right away, and clicking elsewhere closes it."
    >
      <Example
        title="Tab or click to open"
        description="Safari, and Firefox on macOS, don't focus a button when it is clicked, so there a click doesn't open it. Use the checkbox trigger or a <details> wrapper when a click has to work everywhere."
      >
        <span className="popover-anchor">
          <button className="popover-trigger-focus btn-solid/primary">
            Tab to or click to open
          </button>
          <div
            data-slot="popover"
            className="popover card-soft w-56 p-3 text-sm"
          >
            <ShareText />
            <a className="mt-2 inline-block underline" href="#popover-share">
              Copy link
            </a>
          </div>
        </span>
      </Example>
    </Section>

    <Section
      of="trigger-checked"
      title="Checkbox Trigger"
      description="Opens the popover while the trigger is checked: put it on a checkbox, or on a <label> around one. Each click toggles it, without a delay. Clicking outside doesn't close it."
    >
      <Example title="Toggle">
        <span className="popover-anchor">
          <label className="popover-trigger-checked btn-solid/primary">
            <input type="checkbox" className="sr-only" />
            Click to toggle
          </label>
          <div
            data-slot="popover"
            className="popover card-soft w-44 p-1 text-sm"
          >
            <MenuItems />
          </div>
        </span>
      </Example>
    </Section>

    <Section
      of="trigger-delay-*"
      title="Delay"
      description="How long hover and keyboard focus wait before opening and before closing, on any trigger: interestfor buttons and popover-trigger-hover or popover-trigger-focus. Put it on the trigger. A number is milliseconds (popover-trigger-delay-300); brackets take any time (popover-trigger-delay-[1.5s])."
    >
      <Example
        title="Slow to open"
        table={[
          {
            label: "Values",
            content: (
              <span>
                <code className="code-inline">popover-trigger-delay-300</code>{" "}
                is 300ms,{" "}
                <code className="code-inline">
                  popover-trigger-delay-[1.5s]
                </code>{" "}
                any time, and{" "}
                <code className="code-inline">
                  popover-trigger-delay-[normal]
                </code>{" "}
                the default.
              </span>
            ),
          },
          {
            label: "--popover-delay-open, --popover-delay-close",
            content: (
              <span>
                The delays a wrapped popover waits, 500ms and 250ms by default.
                The delay classes set them; you can also set them on the
                popover, for example{" "}
                <code className="code-inline">[--popover-delay-open:1s]</code>,
                or on every wrapped popover with{" "}
                <code className="code-inline">
                  .popover-anchor &gt; [data-slot=&quot;popover&quot;]
                </code>{" "}
                in your CSS.
              </span>
            ),
          },
          {
            label:
              "interest-delay, --interest-delay-start, --interest-delay-end",
            content:
              "The delays the browser uses for interestfor, and the variables the interestfor polyfill reads in browsers without it. The delay classes set them on the trigger.",
          },
        ]}
      >
        <ui-div className="flex flex-wrap gap-3">
          <span className="popover-anchor">
            <button className="popover-trigger-hover btn-outline/surface popover-trigger-delay-0">
              Hover: no delay
            </button>
            <div
              data-slot="popover"
              className="popover card-solid px-2 py-1 text-xs"
            >
              Right away
            </div>
          </span>
          <span className="popover-anchor">
            <button className="popover-trigger-hover btn-outline/surface popover-trigger-delay-1000">
              Hover: 1s delay
            </button>
            <div
              data-slot="popover"
              className="popover card-solid px-2 py-1 text-xs"
            >
              After a second
            </div>
          </span>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="trigger-delay-open-*"
      title="Open Delay"
      description="Only the delay before opening, for example popover-trigger-delay-open-300 (300ms) or popover-trigger-delay-open-[1.5s]. It overrides popover-trigger-delay-{value} on the same trigger."
    />

    <Section
      of="trigger-delay-close-*"
      title="Close Delay"
      description="Only the delay before closing, for example popover-trigger-delay-close-300 (300ms) or popover-trigger-delay-close-[1.5s]. It overrides popover-trigger-delay-{value} on the same trigger."
    />

    <Section
      of="flip"
      title="Flip"
      description="Popovers stay on their side, even when that side runs past the edge of the screen. Add popover-flip to the popover to let it flip to the other side when it doesn't fit, or line up with the trigger's other edge."
    >
      <Example
        title="Flips near an edge"
        description="Scroll until the button is near the top of the window, then open it: the popover moves below the button instead of going off screen."
      >
        <span className="popover-anchor">
          <label className="popover-trigger-checked btn-solid/primary">
            <input type="checkbox" className="sr-only" />
            Click to toggle
          </label>
          <div
            data-slot="popover"
            className="popover-top popover-flip card-soft w-56 p-3 text-sm"
          >
            Above the button when there's room, below it when there isn't.
          </div>
        </span>
      </Example>
    </Section>

    <Section
      title="Gap"
      description="The gap between the trigger and the popover is a 0.5rem margin on the side facing the trigger. Change it with a Tailwind margin on that side."
    >
      <Example
        title="Closer"
        description="popover-top mb-1 sits 0.25rem above the trigger."
      >
        <button
          className="btn-outline/surface"
          commandfor="popover-gap"
          command="toggle-popover"
        >
          Click to open
        </button>
        <div
          id="popover-gap"
          popover="auto"
          className="popover-top card-soft mb-1 px-3 py-2 text-sm"
        >
          0.25rem away
        </div>
      </Example>
    </Section>

    <Section
      title="Nesting"
      description="A wrapper can sit inside another popover. Each popover only opens from its own trigger."
    >
      <Example title="Submenu">
        <span className="popover-anchor">
          <button className="popover-trigger-hover btn-solid/primary popover-trigger-delay-0">
            Hover to open
          </button>
          <div
            data-slot="popover"
            className="popover card-soft w-44 p-1 text-sm"
          >
            <div className="flex flex-col">
              <button className="btn-ghost/surface text-left">New</button>
              <span className="popover-anchor">
                <button className="popover-trigger-hover btn-ghost/surface popover-trigger-delay-0 w-full text-left">
                  Hover for submenu
                </button>
                <div
                  data-slot="popover"
                  className="popover-right-start card-soft w-36 p-1 text-sm"
                >
                  <div className="flex flex-col">
                    <button className="btn-ghost/surface text-left">PDF</button>
                    <button className="btn-ghost/surface text-left">PNG</button>
                  </div>
                </div>
              </span>
            </div>
          </div>
        </span>
      </Example>
    </Section>
  </Page>
);

function PlacementExample({ cls, label }: { cls: string; label: string }) {
  return (
    <>
      <button
        className="btn-outline/surface w-36"
        commandfor={`popover-${cls}`}
        command="toggle-popover"
      >
        {label}
      </button>
      <div
        id={`popover-${cls}`}
        popover="auto"
        className={`${cls} card-soft w-40 px-3 py-2 text-xs`}
      >
        {cls}
      </div>
    </>
  );
}

function ShareText() {
  return (
    <>
      <p className="font-semibold">Share link</p>
      <p className="opacity-80">Anyone with the link can view this file.</p>
    </>
  );
}

function MenuItems() {
  return (
    <div className="flex flex-col">
      <button className="btn-ghost/surface text-left">Rename</button>
      <button className="btn-ghost/surface text-left">Duplicate</button>
      <button className="btn-ghost/danger text-left">Delete</button>
    </div>
  );
}
