/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { ShowcaseJsxNode } from '@nataliebasille/preview-jsx-runtime'

const SUPPORT_INVOKERS =
  'Invoker commands (commandfor/command) work in Chrome and Edge 135+, Firefox 144+, and Safari 26.2+. For older browsers, open the dialog from JavaScript with showModal().'

const SUPPORT_CLOSEDBY =
  'closedby works in Chrome and Edge 134+ and Firefox 141+, but not yet in Safari. Where it is unsupported the dialog falls back to Esc only.'

export default {
  title: 'Dialog',
  description:
    'Styles for the native <dialog> element: placement, width, a dimmed backdrop, open and close animations, and page scroll lock. The dialog adds no surface of its own, so pair it with card classes, and open it with invoker commands or showModal().',
  atAGlance: (
    <ui-div className="md:grid-cols-2 grid w-full gap-4">
      <GlanceFrame label="dialog">
        <dialog open className="absolute inset-0 dialog h-fit w-72 card-soft">
          <PreviewSections title="Centered" />
        </dialog>
      </GlanceFrame>
      <GlanceFrame label="dialog-bottom">
        <dialog open className="absolute inset-0 dialog-bottom h-fit w-full card-soft">
          <PreviewSections title="Bottom sheet" />
        </dialog>
      </GlanceFrame>
    </ui-div>
  ),
  components: {
    dialog: {
      name: 'Dialog',
      description:
        'Centers a native dialog, keeps it within the screen, dims the backdrop, animates it in and out, and locks page scrolling while it is open as a modal. Combine it with a surface such as card-soft and its header, content, and footer slots.',
      showcases: [
        {
          title: 'Basic',
          description:
            'A button with commandfor and command="show-modal" opens the dialog as a modal; command="close" closes it. closedby="any" lets Esc and backdrop clicks close it too. Focus moves into the dialog and returns to the trigger when it closes. See Opening and Closing for how invoker commands work.',
          content: (
            <ExampleDialog
              id="dialog-basic"
              triggerLabel="Open dialog"
              title="Edit profile"
              text="Update your display name and avatar. Changes are visible to your team."
            />
          ),
        },
      ],
    },
    'dialog@variant': {
      name: 'Placement',
      description:
        'Moves the dialog to the top of the screen or turns it into a bottom sheet that slides up. Placements combine with breakpoints, for example a sheet on phones that becomes centered on larger screens.',
      showcases: [
        {
          title: 'Top',
          description: 'dialog-top keeps the dialog near the top edge, centered horizontally.',
          content: (
            <ExampleDialog
              id="dialog-top"
              className="dialog-top card-soft"
              triggerLabel="Open top dialog"
              title="Search"
              text="Top placement suits command palettes and quick search."
            />
          ),
        },
        {
          title: 'Bottom sheet',
          description: 'dialog-bottom sits flush with the bottom edge and slides up when it opens.',
          content: (
            <ExampleDialog
              id="dialog-bottom"
              className="dialog-bottom card-soft"
              triggerLabel="Open bottom sheet"
              title="Share"
              text="Bottom sheets keep actions within thumb reach on phones."
            />
          ),
        },
        {
          title: 'Responsive',
          description:
            'Combine a placement with a breakpoint: dialog-bottom tablet:dialog-center is a sheet on small screens and a centered dialog from the tablet breakpoint up. Any breakpoint variant works, such as sm: in a default Tailwind setup.',
          content: (
            <ExampleDialog
              id="dialog-responsive"
              className="dialog-bottom card-soft tablet:dialog-center"
              triggerLabel="Open responsive dialog"
              title="Filters"
              text="Resize the window to see the placement change."
            />
          ),
        },
      ],
    },
  },
  utilities: {
    'backdrop-none': {
      name: 'No Backdrop',
      description:
        'Removes the default dim from the backdrop. The dialog is still modal: the page behind it stays inert.',
      showcases: [
        {
          title: 'Transparent backdrop',
          description: 'Add dialog-backdrop-none alongside the dialog class.',
          content: (
            <ExampleDialog
              id="dialog-backdrop-none"
              className="dialog card-soft dialog-backdrop-none shadow-xl"
              triggerLabel="Open without backdrop"
              title="No dim"
              text="The page stays visible behind the dialog."
            />
          ),
        },
      ],
    },
  },
  sections: [
    {
      title: 'Opening and Closing',
      description: 'Open and close a dialog with invoker commands, a form, or JavaScript.',
      showcases: [
        {
          title: 'Invoker commands',
          description:
            'Invoker commands let a <button> open and close a dialog with no JavaScript. commandfor points the button at the dialog, command picks the action, and the browser performs it as if you had called the matching dialog method. Try each button below; the reference beneath the code explains every command.',
          content: (
            <>
              <Trigger id="dialog-invokers" label="Open dialog" />
              <dialog
                id="dialog-invokers"
                className="dialog card-soft"
                closedby="any"
                aria-labelledby="dialog-invokers-title"
              >
                <header data-slot="header">
                  <p id="dialog-invokers-title" className="font-semibold">
                    Invoker commands
                  </p>
                </header>
                <div data-slot="content">
                  <p className="text-sm">Each button below closes the dialog a different way.</p>
                </div>
                <footer data-slot="footer" className="flex justify-end gap-2">
                  <button
                    className="btn-ghost/surface"
                    commandfor="dialog-invokers"
                    command="request-close"
                  >
                    Request close
                  </button>
                  <button
                    className="btn-solid/primary"
                    commandfor="dialog-invokers"
                    command="close"
                    value="done"
                  >
                    Done
                  </button>
                </footer>
              </dialog>
            </>
          ),
          table: [
            {
              label: 'commandfor',
              content: (
                <span>
                  The <code className="inline">id</code> of the dialog the button controls.
                </span>
              ),
            },
            {
              label: 'command="show-modal"',
              content: (
                <span>
                  Same as <code className="inline">dialog.showModal()</code>: opens the dialog in
                  the top layer with a backdrop, makes the page behind inert, and moves focus
                  inside.
                </span>
              ),
            },
            {
              label: 'command="close"',
              content: (
                <span>
                  Same as <code className="inline">dialog.close()</code>: closes immediately. The
                  button's <code className="inline">value</code> becomes{' '}
                  <code className="inline">dialog.returnValue</code>.
                </span>
              ),
            },
            {
              label: 'command="request-close"',
              content: (
                <span>
                  Same as <code className="inline">dialog.requestClose()</code>: closes as if Esc
                  were pressed, firing a cancelable <code className="inline">cancel</code> event
                  first so a script can keep the dialog open.
                </span>
              ),
            },
            {
              label: 'Handled for you',
              content:
                'Focus moves into the dialog when it opens and returns to the button that opened it when it closes. Esc and backdrop clicks follow the closedby attribute.',
            },
            {
              label: 'Limits',
              content: (
                <span>
                  Only <code className="inline">&lt;button&gt;</code> elements support{' '}
                  <code className="inline">commandfor</code>, and the dialog must be in the same
                  document. A command button inside a form does not submit it. There is no command
                  for a non-modal dialog; use <code className="inline">dialog.show()</code>.
                </span>
              ),
            },
            {
              label: 'Browser support',
              content: SUPPORT_INVOKERS,
            },
          ],
        },
        {
          title: 'Closing with a form',
          description:
            'Buttons inside <form method="dialog"> close the dialog without JavaScript. The clicked button\'s value becomes dialog.returnValue.',
          content: (
            <>
              <Trigger id="dialog-form" label="Rename file" />
              <dialog
                id="dialog-form"
                className="dialog card-soft"
                closedby="any"
                aria-labelledby="dialog-form-title"
              >
                <header data-slot="header">
                  <p id="dialog-form-title" className="font-semibold">
                    Rename file
                  </p>
                </header>
                <div data-slot="content">
                  <p className="text-sm">Choose Save or Cancel to close the dialog.</p>
                </div>
                <form method="dialog" data-slot="footer" className="flex justify-end gap-2">
                  <button value="cancel" className="btn-ghost/surface">
                    Cancel
                  </button>
                  <button value="save" className="btn-solid/primary">
                    Save
                  </button>
                </form>
              </dialog>
            </>
          ),
        },
        {
          title: 'JavaScript',
          description:
            'Call showModal() to open the dialog as a modal from script. This works in every browser that supports <dialog>.',
          content: (
            <>
              <ScriptTrigger
                html={`<button class="btn-solid/primary" aria-controls="dialog-js" onclick="document.getElementById('dialog-js').showModal()">Open with showModal()</button>`}
              />
              <DialogSurface
                id="dialog-js"
                closedby="any"
                closeWith="form"
                title="Opened from script"
                text="This Close button sits in a form with method set to dialog, so it works in every browser that supports dialog, like dialog.close()."
              />
            </>
          ),
        },
        {
          title: 'Non-modal',
          description:
            'Call show() to open the dialog without a backdrop. The page stays interactive and scrollable, and the dialog is positioned in the page flow.',
          content: (
            <ui-div className="relative min-h-80 w-full">
              <ScriptTrigger
                html={`<button class="btn-solid/primary" aria-controls="dialog-non-modal" onclick="document.getElementById('dialog-non-modal').show()">Show non-modal dialog</button>`}
              />
              <DialogSurface
                id="dialog-non-modal"
                className="dialog card-soft shadow-xl"
                closeWith="form"
                title="Non-modal"
                text="You can still interact with the page behind this dialog."
              />
            </ui-div>
          ),
        },
      ],
    },
    {
      title: 'Dismissal',
      description: `The browser default for a modal dialog is Esc only. These docs add closedby="any" to their examples so Esc and backdrop clicks both close them; set closedby to choose the behavior. ${SUPPORT_CLOSEDBY}`,
      showcases: [
        {
          title: 'Esc only',
          description:
            'closedby="closerequest" (or no closedby at all) closes on Esc but ignores backdrop clicks.',
          content: (
            <ExampleDialog
              id="dialog-esc-only"
              closedby="closerequest"
              triggerLabel="Open Esc-only dialog"
              title="Esc only"
              text="Press Esc or use the Close button. Clicking outside does nothing."
            />
          ),
        },
        {
          title: 'No dismissal',
          description:
            'closedby="none" ignores Esc and backdrop clicks, so the dialog only closes from its own controls.',
          content: (
            <ExampleDialog
              id="dialog-no-dismiss"
              closedby="none"
              triggerLabel="Open required dialog"
              title="Finish setup"
              text="This dialog only closes from its Close button."
            />
          ),
        },
      ],
    },
    {
      title: 'Alert Dialog',
      description:
        'For confirmations that need a deliberate answer, add role="alertdialog" and leave out closedby="any" so backdrop clicks don\'t dismiss it. Put the safest action first: the dialog focuses the first focusable element when it opens.',
      showcases: [
        {
          title: 'Confirm a destructive action',
          content: (
            <>
              <Trigger id="dialog-alert" label="Delete project" className="btn-solid/danger" />
              <dialog
                id="dialog-alert"
                role="alertdialog"
                className="dialog card-soft"
                aria-labelledby="dialog-alert-title"
                aria-describedby="dialog-alert-text"
              >
                <header data-slot="header">
                  <p id="dialog-alert-title" className="font-semibold">
                    Delete project?
                  </p>
                </header>
                <div data-slot="content">
                  <p id="dialog-alert-text" className="text-sm">
                    This permanently deletes the project and its files.
                  </p>
                </div>
                <form method="dialog" data-slot="footer" className="flex justify-end gap-2">
                  <button value="cancel" className="btn-ghost/surface">
                    Cancel
                  </button>
                  <button value="delete" className="btn-solid/danger">
                    Delete
                  </button>
                </form>
              </dialog>
            </>
          ),
        },
      ],
    },
    {
      title: 'Width',
      description:
        'The dialog is 32rem wide by default and never wider than the screen. Use Tailwind width utilities for anything else.',
      showcases: [
        {
          title: 'Custom width',
          description: 'Any width utility overrides the default, for example w-3xl.',
          content: (
            <ExampleDialog
              id="dialog-wide"
              className="dialog w-3xl card-soft"
              triggerLabel="Open wide dialog"
              title="Wide dialog"
              text="Still capped to the screen on small viewports."
            />
          ),
        },
        {
          title: 'Full screen',
          description:
            'size-full max-w-none max-h-none m-0 rounded-none makes the dialog fill the viewport.',
          content: (
            <ExampleDialog
              id="dialog-fullscreen"
              className="dialog m-0 size-full max-h-none max-w-none card-soft rounded-none"
              triggerLabel="Open full-screen dialog"
              title="Full screen"
              text="The dialog fills the viewport."
            />
          ),
        },
      ],
    },
    {
      title: 'Customizing the Backdrop',
      description:
        "Style the backdrop with Tailwind's backdrop: variant. Its utilities override the default dim.",
      showcases: [
        {
          title: 'Blurred backdrop',
          description: 'backdrop:bg-black/60 backdrop:backdrop-blur-md darkens and blurs the page.',
          content: (
            <ExampleDialog
              id="dialog-backdrop-blur"
              className="dialog card-soft backdrop:bg-black/60 backdrop:backdrop-blur-md"
              triggerLabel="Open with blurred backdrop"
              title="Blurred backdrop"
              text="Any backdrop: utility works, such as color, opacity, or blur."
            />
          ),
        },
      ],
    },
  ],
  cssvars: {
    '--width': 'Default dialog width. The default is 32rem.',
    '--gutter': 'Minimum space kept between the dialog and the screen edges. The default is 1rem.',
    '--duration': 'Length of the open and close animations. The default is 200ms.',
    '--backdrop': 'Default backdrop color. The default is black at 50% opacity.',
  },
} satisfies Documentation<
  typeof import('../../../../../packages/core-v2/src/tailwind/components/dialog/dialog.css.ts').default
>

function ExampleDialog({
  id,
  className,
  closedby = 'any',
  triggerLabel,
  title,
  text,
}: {
  id: string
  className?: string
  closedby?: 'any' | 'closerequest' | 'none'
  triggerLabel: string
  title: string
  text: string
}) {
  return (
    <>
      <Trigger id={id} label={triggerLabel} />
      <DialogSurface id={id} className={className} closedby={closedby} title={title} text={text} />
    </>
  )
}

function Trigger({
  id,
  label,
  className = 'btn-solid/primary',
}: {
  id: string
  label: string
  className?: string
}) {
  return (
    <button className={className} commandfor={id} command="show-modal">
      {label}
    </button>
  )
}

function DialogSurface({
  id,
  className = 'dialog card-soft',
  closedby,
  closeWith = 'command',
  title,
  text,
}: {
  id: string
  className?: string
  closedby?: 'any' | 'closerequest' | 'none'
  /** 'form' closes through <form method="dialog">, which works without invoker commands. */
  closeWith?: 'command' | 'form'
  title: string
  text: string
}) {
  return (
    <dialog id={id} className={className} closedby={closedby} aria-labelledby={`${id}-title`}>
      <header data-slot="header">
        <p id={`${id}-title`} className="font-semibold">
          {title}
        </p>
      </header>
      <div data-slot="content">
        <p className="text-sm">{text}</p>
      </div>
      {closeWith === 'form' ? (
        <form method="dialog" data-slot="footer" className="flex justify-end">
          <button className="btn-ghost/surface">Close</button>
        </form>
      ) : (
        <footer data-slot="footer" className="flex justify-end">
          <button className="btn-ghost/surface" commandfor={id} command="close">
            Close
          </button>
        </footer>
      )}
    </dialog>
  )
}

/**
 * Inline onclick handlers can't be passed through server-rendered JSX, so the
 * preview injects the same HTML the snippet shows.
 */
function ScriptTrigger({ html }: { html: string }) {
  return (
    <>
      <ui-div className="contents" dangerouslySetInnerHTML={{ __html: html }} />
      <markup>{html}</markup>
    </>
  )
}

function GlanceFrame({ label, children }: { label: string; children: ShowcaseJsxNode }) {
  return (
    <ui-div className="space-y-2">
      <span className="inline-flex rounded bg-surface-50/80 px-2 py-1 font-mono text-xs text-on-surface-50/70">
        {label}
      </span>
      <ui-div className="relative h-56 overflow-hidden rounded-xl border border-surface-300/40 bg-black/50">
        {children}
      </ui-div>
    </ui-div>
  )
}

function PreviewSections({ title }: { title: string }) {
  return (
    <>
      <header data-slot="header">
        <p className="text-sm font-semibold">{title}</p>
      </header>
      <div data-slot="content">
        <p className="text-xs opacity-70">Dialog content goes here.</p>
      </div>
    </>
  )
}
