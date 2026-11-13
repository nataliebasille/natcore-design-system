/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { ShowcaseJsxNode } from '@nataliebasille/preview-jsx-runtime'
import popover from '../../../../../packages/core-v2/src/tailwind/components/popover/popover.css.ts'

const SUPPORT_ANCHORING =
  'Popovers are placed with CSS anchor positioning: Chrome and Edge 125+, Safari 26+, and Firefox 147+. Older browsers still open and close them, but not next to their trigger.'

const SUPPORT_INVOKERS =
  'commandfor works in Chrome and Edge 135+, Firefox 144+, and Safari 26.2+. popovertarget does the same in every browser with popover support.'

const SUPPORT_INTEREST =
  'interestfor works in Chrome and Edge 142+. Other browsers ignore it unless you load the interestfor polyfill; for no JavaScript at all, use a wrapper with popover-trigger-hover instead.'

const PLACEMENT_GROUPS = [
  {
    title: 'Below',
    side: 'bottom',
    placements: [
      { cls: 'popover-bottom-start', label: 'Click: Start' },
      { cls: 'popover-bottom', label: 'Click: Center' },
      { cls: 'popover-bottom-end', label: 'Click: End' },
    ],
  },
  {
    title: 'Above',
    side: 'top',
    placements: [
      { cls: 'popover-top-start', label: 'Click: Start' },
      { cls: 'popover-top', label: 'Click: Center' },
      { cls: 'popover-top-end', label: 'Click: End' },
    ],
  },
  {
    title: 'Left',
    side: 'left',
    placements: [
      { cls: 'popover-left-start', label: 'Click: Start' },
      { cls: 'popover-left', label: 'Click: Center' },
      { cls: 'popover-left-end', label: 'Click: End' },
    ],
  },
  {
    title: 'Right',
    side: 'right',
    placements: [
      { cls: 'popover-right-start', label: 'Click: Start' },
      { cls: 'popover-right', label: 'Click: Center' },
      { cls: 'popover-right-end', label: 'Click: End' },
    ],
  },
] as const

export default {
  module: popover,
  title: 'Popover',
  description:
    'Positions floating content next to the element that opens it, with no JavaScript. Open it natively with commandfor or interestfor, or put the trigger and the popover in a popover-anchor wrapper and pick how CSS opens it: hover, focus, or a checkbox. The popover adds no surface of its own, so pair it with card classes.',
  atAGlance: (
    <ui-div className="flex w-full flex-wrap items-center justify-center gap-16 py-4">
      <span className="popover-anchor">
        <label className="popover-trigger-checked btn-solid/primary">
          <input type="checkbox" className="sr-only" />
          Click for menu
        </label>
        <div data-slot="popover" className="popover w-44 card-soft p-1 text-sm">
          <MenuItems />
        </div>
      </span>
      <span className="popover-anchor">
        <button className="popover-trigger-hover btn-outline/surface">Hover for tooltip</button>
        <div data-slot="popover" className="popover-right card-solid px-2 py-1 text-xs">
          Move to trash
        </div>
      </span>
    </ui-div>
  ),
  components: {
    popover: {
      name: 'Popover',
      description:
        'Put popover on the floating element. Opened natively, it sits below the button that opened it, 0.5rem away, centered. It stays below even near the edge of the screen; add popover-flip to let it flip. It fades in and out and stays above overflow: hidden containers. Use it with the native popover attribute and a button that opens it.',
      showcases: [
        {
          title: 'Click',
          description:
            'A button with commandfor and command="toggle-popover" opens and closes the popover. Clicking outside or pressing Esc closes it too.',
          content: (
            <>
              <button
                className="btn-solid/primary"
                commandfor="popover-click"
                command="toggle-popover"
              >
                Click to open
              </button>
              <div id="popover-click" popover="auto" className="popover w-56 card-soft p-3 text-sm">
                <ShareText />
              </div>
            </>
          ),
          table: [
            {
              label: 'commandfor',
              content: (
                <span>
                  The <code className="inline">id</code> of the popover the button controls, with{' '}
                  <code className="inline">command</code> set to{' '}
                  <code className="inline">toggle-popover</code>,{' '}
                  <code className="inline">show-popover</code>, or{' '}
                  <code className="inline">hide-popover</code>.
                </span>
              ),
            },
            {
              label: 'popovertarget',
              content: (
                <span>
                  The older attribute for the same thing:{' '}
                  <code className="inline">popovertarget=&quot;popover-click&quot;</code> on the
                  button toggles the popover.
                </span>
              ),
            },
            {
              label: 'Placement',
              content:
                'The popover is placed against the button that opened it. Nothing else connects them.',
            },
            { label: 'Browser support', content: SUPPORT_INVOKERS },
          ],
        },
        {
          title: 'Tooltip',
          description:
            'interestfor opens the popover when the button is hovered or focused, after a short delay, and closes it when the pointer or focus leaves. popover="hint" keeps it from closing other popovers.',
          content: (
            <>
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
            </>
          ),
          table: [
            {
              label: 'interestfor',
              content: (
                <span>
                  The <code className="inline">id</code> of the popover. The browser shows it after
                  0.5s of hover or focus and hides it 0.25s after interest is lost; change that with{' '}
                  <code className="inline">popover-trigger-delay-{'{value}'}</code> on the button,
                  for example <code className="inline">popover-trigger-delay-300</code>.
                </span>
              ),
            },
            { label: 'Browser support', content: SUPPORT_INTEREST },
          ],
        },
      ],
    },
    'popover@variant': {
      name: 'Placement',
      description:
        "popover-{side}, popover-{side}-start, and popover-{side}-end are complete popovers on that side of the trigger; use one instead of popover. Start and end line the popover up with the trigger's edges. A placement stays on its side even near the edge of the screen, unless the popover also has popover-flip.",
      showcases: [
        ...PLACEMENT_GROUPS.map(({ title, side, placements }) => ({
          title,
          content: (
            <ui-div
              className={
                side === 'left' || side === 'right'
                  ? 'flex flex-col items-center gap-3 py-2'
                  : 'flex flex-wrap items-center justify-center gap-3 py-2'
              }
            >
              {placements.map(({ cls, label }) => (
                <PlacementExample key={cls} id={`popover-${cls}`} cls={cls} label={label} />
              ))}
            </ui-div>
          ),
        })),
        {
          title: 'Responsive',
          description:
            'Placements combine with breakpoints: popover-bottom tablet:popover-right is below the trigger on small screens and beside it from the tablet breakpoint up.',
          content: (
            <>
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
                className="popover-bottom w-48 card-soft p-3 text-sm tablet:popover-right"
              >
                Resize the window to move me.
              </div>
            </>
          ),
        },
      ],
    },
  },
  utilities: {
    anchor: {
      name: 'Wrapper',
      description:
        'Put popover-anchor on an element around a trigger and a popover marked data-slot="popover". The popover is placed against the wrapper and opened by CSS, so it works in every browser with no JavaScript. Choose how it opens with popover-trigger-hover, popover-trigger-focus, or popover-trigger-checked on the trigger. An open <details class="popover-anchor"> shows its popover too.',
      showcases: [
        {
          title: 'Details',
          description:
            'A <details> wrapper opens and closes on each click of its <summary>, with keyboard support built in.',
          content: (
            <details className="popover-anchor">
              <summary className="btn-outline/surface list-none">Click to open</summary>
              <div data-slot="popover" className="popover w-44 card-soft p-1 text-sm">
                <MenuItems />
              </div>
            </details>
          ),
          table: [
            {
              label: 'data-slot="popover"',
              content:
                'Marks the popover. It must be a direct child of the wrapper; everything else in the wrapper is the trigger side.',
            },
            {
              label: 'Top layer',
              content:
                "A popover opened by CSS isn't in the top layer. It has z-index: 50, so it stays above later content in the same stacking context; change it with a z-index utility like z-10. It is position: fixed, so overflow: hidden ancestors don't clip it, unless an ancestor has a transform or filter.",
            },
            { label: 'Browser support', content: SUPPORT_ANCHORING },
          ],
        },
      ],
    },
    'trigger-hover': {
      name: 'Hover Trigger',
      description:
        "Opens the wrapper's popover while the trigger is hovered, after 0.5s, and closes it 0.25s after the pointer leaves the wrapper. The popover stays open while the pointer moves onto it.",
      showcases: [
        {
          title: 'Tooltip',
          content: (
            <span className="popover-anchor">
              <button className="popover-trigger-hover btn-outline/surface">Hover to open</button>
              <div data-slot="popover" className="popover-top card-solid px-2 py-1 text-xs">
                Works in every browser
              </div>
            </span>
          ),
        },
      ],
    },
    'trigger-focus': {
      name: 'Focus Trigger',
      description:
        'Opens the popover while the trigger or anything in the popover has focus. Keyboard focus waits for the open delay, like interestfor; a click opens it right away, and clicking elsewhere closes it.',
      showcases: [
        {
          title: 'Tab or click to open',
          description:
            "Safari, and Firefox on macOS, don't focus a button when it is clicked, so there a click doesn't open it. Use the checkbox trigger or a <details> wrapper when a click has to work everywhere.",
          content: (
            <span className="popover-anchor">
              <button className="popover-trigger-focus btn-solid/primary">
                Tab to or click to open
              </button>
              <div data-slot="popover" className="popover w-56 card-soft p-3 text-sm">
                <ShareText />
                <a className="mt-2 inline-block underline" href="#popover-share">
                  Copy link
                </a>
              </div>
            </span>
          ),
        },
      ],
    },
    'trigger-checked': {
      name: 'Checkbox Trigger',
      description:
        "Opens the popover while the trigger is checked: put it on a checkbox, or on a <label> around one. Each click toggles it, without a delay. Clicking outside doesn't close it.",
      showcases: [
        {
          title: 'Toggle',
          content: (
            <span className="popover-anchor">
              <label className="popover-trigger-checked btn-solid/primary">
                <input type="checkbox" className="sr-only" />
                Click to toggle
              </label>
              <div data-slot="popover" className="popover w-44 card-soft p-1 text-sm">
                <MenuItems />
              </div>
            </span>
          ),
        },
      ],
    },
    'trigger-delay-*': {
      name: 'Delay',
      description:
        'How long hover and keyboard focus wait before opening and before closing, on any trigger: interestfor buttons and popover-trigger-hover or popover-trigger-focus. Put it on the trigger. A number is milliseconds (popover-trigger-delay-300); brackets take any time (popover-trigger-delay-[1.5s]).',
      showcases: [
        {
          title: 'Slow to open',
          content: (
            <ui-div className="flex flex-wrap gap-3">
              <span className="popover-anchor">
                <button className="popover-trigger-hover btn-outline/surface popover-trigger-delay-0">
                  Hover: no delay
                </button>
                <div data-slot="popover" className="popover card-solid px-2 py-1 text-xs">
                  Right away
                </div>
              </span>
              <span className="popover-anchor">
                <button className="popover-trigger-hover btn-outline/surface popover-trigger-delay-1000">
                  Hover: 1s delay
                </button>
                <div data-slot="popover" className="popover card-solid px-2 py-1 text-xs">
                  After a second
                </div>
              </span>
            </ui-div>
          ),
          table: [
            {
              label: 'Values',
              content: (
                <span>
                  <code className="inline">popover-trigger-delay-300</code> is 300ms,{' '}
                  <code className="inline">popover-trigger-delay-[1.5s]</code> any time, and{' '}
                  <code className="inline">popover-trigger-delay-[normal]</code> the default.
                </span>
              ),
            },
            {
              label: '--popover-delay-open, --popover-delay-close',
              content: (
                <span>
                  The delays a wrapped popover waits, 500ms and 250ms by default. The delay classes
                  set them; you can also set them on the popover, for example{' '}
                  <code className="inline">[--popover-delay-open:1s]</code>, or on every wrapped
                  popover with{' '}
                  <code className="inline">
                    .popover-anchor &gt; [data-slot=&quot;popover&quot;]
                  </code>{' '}
                  in your CSS.
                </span>
              ),
            },
            {
              label: 'interest-delay, --interest-delay-start, --interest-delay-end',
              content:
                'The delays the browser uses for interestfor, and the variables the interestfor polyfill reads in browsers without it. The delay classes set them on the trigger.',
            },
          ],
        },
      ],
    },
    'trigger-delay-open-*': {
      name: 'Open Delay',
      description:
        'Only the delay before opening, for example popover-trigger-delay-open-300 (300ms) or popover-trigger-delay-open-[1.5s]. It overrides popover-trigger-delay-{value} on the same trigger.',
    },
    'trigger-delay-close-*': {
      name: 'Close Delay',
      description:
        'Only the delay before closing, for example popover-trigger-delay-close-300 (300ms) or popover-trigger-delay-close-[1.5s]. It overrides popover-trigger-delay-{value} on the same trigger.',
    },
    flip: {
      name: 'Flip',
      description:
        "Popovers stay on their side, even when that side runs past the edge of the screen. Add popover-flip to the popover to let it flip to the other side when it doesn't fit, or line up with the trigger's other edge.",
      showcases: [
        {
          title: 'Flips near an edge',
          description:
            'Scroll until the button is near the top of the window, then open it: the popover moves below the button instead of going off screen.',
          content: (
            <span className="popover-anchor">
              <label className="popover-trigger-checked btn-solid/primary">
                <input type="checkbox" className="sr-only" />
                Click to toggle
              </label>
              <div
                data-slot="popover"
                className="popover-top popover-flip w-56 card-soft p-3 text-sm"
              >
                Above the button when there&apos;s room, below it when there isn&apos;t.
              </div>
            </span>
          ),
        },
      ],
    },
  },
  sections: [
    {
      title: 'Gap',
      description:
        'The gap between the trigger and the popover is a 0.5rem margin on the side facing the trigger. Change it with a Tailwind margin on that side.',
      showcases: [
        {
          title: 'Closer',
          description: 'popover-top mb-1 sits 0.25rem above the trigger.',
          content: (
            <>
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
                className="popover-top mb-1 card-soft px-3 py-2 text-sm"
              >
                0.25rem away
              </div>
            </>
          ),
        },
      ],
    },
    {
      title: 'Nesting',
      description:
        'A wrapper can sit inside another popover. Each popover only opens from its own trigger.',
      showcases: [
        {
          title: 'Submenu',
          content: (
            <span className="popover-anchor">
              <button className="popover-trigger-hover btn-solid/primary popover-trigger-delay-0">
                Hover to open
              </button>
              <div data-slot="popover" className="popover w-44 card-soft p-1 text-sm">
                <div className="flex flex-col">
                  <button className="btn-ghost/surface text-left">New</button>
                  <span className="popover-anchor">
                    <button className="popover-trigger-hover w-full btn-ghost/surface text-left popover-trigger-delay-0">
                      Hover for submenu
                    </button>
                    <div
                      data-slot="popover"
                      className="popover-right-start w-36 card-soft p-1 text-sm"
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
          ),
        },
      ],
    },
  ],
} satisfies Documentation<typeof popover>

function PlacementExample({ id, cls, label }: { id: string; cls: string; label: string }) {
  return (
    <>
      <button className="w-36 btn-outline/surface" commandfor={id} command="toggle-popover">
        {label}
      </button>
      <div id={id} popover="auto" className={`${cls} w-40 card-soft px-3 py-2 text-xs`}>
        {cls}
      </div>
    </>
  )
}

function ShareText() {
  return (
    <>
      <p className="font-semibold">Share link</p>
      <p className="opacity-80">Anyone with the link can view this file.</p>
    </>
  )
}

function MenuItems(): ShowcaseJsxNode {
  return (
    <div className="flex flex-col">
      <button className="btn-ghost/surface text-left">Rename</button>
      <button className="btn-ghost/surface text-left">Duplicate</button>
      <button className="btn-ghost/danger text-left">Delete</button>
    </div>
  )
}
