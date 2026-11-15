import { control, docsFor } from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import dialog from "./dialog.css.ts";

const { Page, Playground, Section, Example } = docsFor(dialog);

const SUPPORT_INVOKERS =
  "Invoker commands (commandfor/command) work in Chrome and Edge 135+, Firefox 144+, and Safari 26.2+. For older browsers, open the dialog from JavaScript with showModal().";

const SUPPORT_CLOSEDBY =
  "closedby works in Chrome and Edge 134+ and Firefox 141+, but not yet in Safari. Where it is unsupported the dialog falls back to Esc only.";

const PLACEMENT_CLASSES = {
  center: "dialog",
  top: "dialog-top",
  bottom: "dialog-bottom",
} as const;

const BACKDROP_CLASSES = {
  default: "",
  blur: " backdrop:bg-black/60 backdrop:backdrop-blur-md",
  none: " dialog-backdrop-none",
} as const;

export default (
  <Page
    title="Dialog"
    description="Styles for the native <dialog> element: placement, width, a dimmed backdrop, open and close animations, and page scroll lock. The dialog adds no surface of its own, so pair it with card classes, and open it with invoker commands or showModal()."
    atAGlance={
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
        <GlanceFrame label="dialog">
          <dialog open className="dialog card-soft absolute inset-0 h-fit w-72">
            <PreviewSections title="Centered" />
          </dialog>
        </GlanceFrame>
        <GlanceFrame label="dialog-bottom">
          <dialog
            open
            className="dialog-bottom card-soft absolute inset-0 h-fit w-full"
          >
            <PreviewSections title="Bottom sheet" />
          </dialog>
        </GlanceFrame>
      </div>
    }
  >
    <Playground
      controls={{
        variant: {
          label: "Placement",
          optionLabels: {
            center: "Center",
            top: "Top",
            bottom: "Bottom sheet",
          },
        },
        dismissal: control.select(["any", "closerequest", "none"], {
          label: "Dismissal (closedby)",
          optionLabels: {
            any: "Esc or backdrop click",
            closerequest: "Esc only",
            none: "Close button only",
          },
        }),
        backdrop: control.select(["default", "blur", "none"], {
          optionLabels: {
            default: "Default dim",
            blur: "Blurred (backdrop: utilities)",
            none: "None (dialog-backdrop-none)",
          },
        }),
      }}
      render={(v) => (
        <>
          <button
            className="btn-solid/primary"
            commandfor="dialog-playground"
            command="show-modal"
          >
            Open dialog
          </button>
          <dialog
            id="dialog-playground"
            className={`${PLACEMENT_CLASSES[v.variant]} card-soft${BACKDROP_CLASSES[v.backdrop]}`}
            closedby={v.dismissal}
            aria-labelledby="dialog-playground-title"
          >
            <header data-slot="header">
              <p id="dialog-playground-title" className="font-semibold">
                Invite teammates
              </p>
            </header>
            <div data-slot="content">
              <p className="text-sm">
                Teammates get an email with a link to join this workspace.
              </p>
            </div>
            <footer data-slot="footer" className="flex justify-end gap-2">
              <button
                className="btn-ghost/surface"
                commandfor="dialog-playground"
                command="close"
              >
                Cancel
              </button>
              <button
                className="btn-solid/primary"
                commandfor="dialog-playground"
                command="close"
              >
                Send invites
              </button>
            </footer>
          </dialog>
        </>
      )}
    />

    <Section
      of="dialog"
      description="Centers a native dialog, keeps it within the screen, dims the backdrop, animates it in and out, and locks page scrolling while it is open as a modal. Combine it with a surface such as card-soft and its header, content, and footer slots."
      vars={{
        "--width": "Default dialog width. The default is 32rem.",
        "--gutter":
          "Minimum space kept between the dialog and the screen edges. The default is 1rem.",
        "--duration":
          "Length of the open and close animations. The default is 200ms.",
        "--backdrop":
          "Default backdrop color. The default is black at 50% opacity.",
      }}
    >
      <Example
        title="Basic"
        description='A button with commandfor and command="show-modal" opens the dialog as a modal; command="close" closes it. closedby="any" lets Esc and backdrop clicks close it too. Focus moves into the dialog and returns to the trigger when it closes. See Opening and Closing for how invoker commands work.'
      >
        <ExampleDialog
          id="dialog-basic"
          triggerLabel="Open dialog"
          title="Edit profile"
          text="Update your display name and avatar. Changes are visible to your team."
        />
      </Example>
    </Section>

    <Section
      of="dialog@variant"
      title="Placement"
      description="Moves the dialog to the top of the screen or turns it into a bottom sheet that slides up. Placements combine with responsive variants, for example a sheet on phones that becomes centered on larger screens."
    >
      <Example
        title="Top"
        description="dialog-top keeps the dialog near the top edge, centered horizontally."
      >
        <ExampleDialog
          id="dialog-top"
          className="dialog-top card-soft"
          triggerLabel="Open top dialog"
          title="Search"
          text="Top placement suits command palettes and quick search."
        />
      </Example>

      <Example
        title="Bottom sheet"
        description="dialog-bottom sits flush with the bottom edge and slides up when it opens."
      >
        <ExampleDialog
          id="dialog-bottom"
          className="dialog-bottom card-soft"
          triggerLabel="Open bottom sheet"
          title="Share"
          text="Bottom sheets keep actions within thumb reach on phones."
        />
      </Example>

      <Example
        title="Responsive"
        description="Combine a placement with a responsive variant: dialog-bottom min-[48rem]:dialog-center is a sheet on narrow screens and a centered dialog from 48rem up. Breakpoint variants from your theme, such as md:, work the same way."
      >
        <ExampleDialog
          id="dialog-responsive"
          className="dialog-bottom card-soft min-[48rem]:dialog-center"
          triggerLabel="Open responsive dialog"
          title="Filters"
          text="Resize the window to see the placement change."
        />
      </Example>
    </Section>

    <Section
      of="backdrop-none"
      title="No Backdrop"
      description="Removes the default dim from the backdrop. The dialog is still modal: the page behind it stays inert."
    >
      <Example
        title="Transparent backdrop"
        description="Add dialog-backdrop-none alongside the dialog class."
      >
        <ExampleDialog
          id="dialog-backdrop-none"
          className="dialog card-soft dialog-backdrop-none shadow-xl"
          triggerLabel="Open without backdrop"
          title="No dim"
          text="The page stays visible behind the dialog."
        />
      </Example>
    </Section>

    <Section
      title="Opening and Closing"
      description="Open and close a dialog with invoker commands, a form, or JavaScript."
    >
      <Example
        title="Invoker commands"
        description="Invoker commands let a <button> open and close a dialog with no JavaScript. commandfor points the button at the dialog, command picks the action, and the browser performs it as if you had called the matching dialog method. Try each button below; the reference beneath the code explains every command."
        table={[
          {
            label: "commandfor",
            content: (
              <span>
                The <code className="code-inline">id</code> of the dialog the
                button controls.
              </span>
            ),
          },
          {
            label: 'command="show-modal"',
            content: (
              <span>
                Same as <code className="code-inline">dialog.showModal()</code>:
                opens the dialog in the top layer with a backdrop, makes the
                page behind inert, and moves focus inside.
              </span>
            ),
          },
          {
            label: 'command="close"',
            content: (
              <span>
                Same as <code className="code-inline">dialog.close()</code>:
                closes immediately. The button's{" "}
                <code className="code-inline">value</code> becomes{" "}
                <code className="code-inline">dialog.returnValue</code>.
              </span>
            ),
          },
          {
            label: 'command="request-close"',
            content: (
              <span>
                Same as{" "}
                <code className="code-inline">dialog.requestClose()</code>:
                closes as if Esc were pressed, firing a cancelable{" "}
                <code className="code-inline">cancel</code> event first so a
                script can keep the dialog open.
              </span>
            ),
          },
          {
            label: "Handled for you",
            content:
              "Focus moves into the dialog when it opens and returns to the button that opened it when it closes. Esc and backdrop clicks follow the closedby attribute.",
          },
          {
            label: "Limits",
            content: (
              <span>
                Only <code className="code-inline">&lt;button&gt;</code>{" "}
                elements support <code className="code-inline">commandfor</code>
                , and the dialog must be in the same document. A command button
                inside a form does not submit it. There is no command for a
                non-modal dialog; use{" "}
                <code className="code-inline">dialog.show()</code>.
              </span>
            ),
          },
          { label: "Browser support", content: SUPPORT_INVOKERS },
        ]}
      >
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
            <p className="text-sm">
              Each button below closes the dialog a different way.
            </p>
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
      </Example>

      <Example
        title="Closing with a form"
        description={`Buttons inside <form method="dialog"> close the dialog without JavaScript. The clicked button's value becomes dialog.returnValue.`}
      >
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
            <p className="text-sm">
              Choose Save or Cancel to close the dialog.
            </p>
          </div>
          <form
            method="dialog"
            data-slot="footer"
            className="flex justify-end gap-2"
          >
            <button value="cancel" className="btn-ghost/surface">
              Cancel
            </button>
            <button value="save" className="btn-solid/primary">
              Save
            </button>
          </form>
        </dialog>
      </Example>

      <Example
        title="JavaScript"
        description="Call showModal() to open the dialog as a modal from script. This works in every browser that supports <dialog>."
      >
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
      </Example>

      <Example
        title="Non-modal"
        description="Call show() to open the dialog without a backdrop. The page stays interactive and scrollable, and the dialog is positioned in the page flow."
      >
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
      </Example>
    </Section>

    <Section
      title="Dismissal"
      description={`The browser default for a modal dialog is Esc only. These docs add closedby="any" to their examples so Esc and backdrop clicks both close them; set closedby to choose the behavior. ${SUPPORT_CLOSEDBY}`}
    >
      <Example
        title="Esc only"
        description='closedby="closerequest" (or no closedby at all) closes on Esc but ignores backdrop clicks.'
      >
        <ExampleDialog
          id="dialog-esc-only"
          closedby="closerequest"
          triggerLabel="Open Esc-only dialog"
          title="Esc only"
          text="Press Esc or use the Close button. Clicking outside does nothing."
        />
      </Example>

      <Example
        title="No dismissal"
        description='closedby="none" ignores Esc and backdrop clicks, so the dialog only closes from its own controls.'
      >
        <ExampleDialog
          id="dialog-no-dismiss"
          closedby="none"
          triggerLabel="Open required dialog"
          title="Finish setup"
          text="This dialog only closes from its Close button."
        />
      </Example>
    </Section>

    <Section
      title="Alert Dialog"
      description={`For confirmations that need a deliberate answer, add role="alertdialog" and leave out closedby="any" so backdrop clicks don't dismiss it. Put the safest action first: the dialog focuses the first focusable element when it opens.`}
    >
      <Example title="Confirm a destructive action">
        <Trigger
          id="dialog-alert"
          label="Delete project"
          className="btn-solid/danger"
        />
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
          <form
            method="dialog"
            data-slot="footer"
            className="flex justify-end gap-2"
          >
            <button value="cancel" className="btn-ghost/surface">
              Cancel
            </button>
            <button value="delete" className="btn-solid/danger">
              Delete
            </button>
          </form>
        </dialog>
      </Example>
    </Section>

    <Section
      title="Width"
      description="The dialog is 32rem wide by default and never wider than the screen. Use Tailwind width utilities for anything else."
    >
      <Example
        title="Custom width"
        description="Any width utility overrides the default, for example w-3xl."
      >
        <ExampleDialog
          id="dialog-wide"
          className="dialog card-soft w-3xl"
          triggerLabel="Open wide dialog"
          title="Wide dialog"
          text="Still capped to the screen on small viewports."
        />
      </Example>

      <Example
        title="Full screen"
        description="size-full max-w-none max-h-none m-0 rounded-none makes the dialog fill the viewport."
      >
        <ExampleDialog
          id="dialog-fullscreen"
          className="dialog card-soft m-0 size-full max-h-none max-w-none rounded-none"
          triggerLabel="Open full-screen dialog"
          title="Full screen"
          text="The dialog fills the viewport."
        />
      </Example>
    </Section>

    <Section
      title="Customizing the Backdrop"
      description="Style the backdrop with Tailwind's backdrop: variant. Its utilities override the default dim."
    >
      <Example
        title="Blurred backdrop"
        description="backdrop:bg-black/60 backdrop:backdrop-blur-md darkens and blurs the page."
      >
        <ExampleDialog
          id="dialog-backdrop-blur"
          className="dialog card-soft backdrop:bg-black/60 backdrop:backdrop-blur-md"
          triggerLabel="Open with blurred backdrop"
          title="Blurred backdrop"
          text="Any backdrop: utility works, such as color, opacity, or blur."
        />
      </Example>
    </Section>
  </Page>
);

function ExampleDialog({
  id,
  className,
  closedby = "any",
  triggerLabel,
  title,
  text,
}: {
  id: string;
  className?: string;
  closedby?: "any" | "closerequest" | "none";
  triggerLabel: string;
  title: string;
  text: string;
}) {
  return (
    <>
      <Trigger id={id} label={triggerLabel} />
      <DialogSurface
        id={id}
        className={className}
        closedby={closedby}
        title={title}
        text={text}
      />
    </>
  );
}

function Trigger({
  id,
  label,
  className = "btn-solid/primary",
}: {
  id: string;
  label: string;
  className?: string;
}) {
  return (
    <button className={className} commandfor={id} command="show-modal">
      {label}
    </button>
  );
}

function DialogSurface({
  id,
  className = "dialog card-soft",
  closedby,
  closeWith = "command",
  title,
  text,
}: {
  id: string;
  className?: string;
  closedby?: "any" | "closerequest" | "none";
  /** "form" closes through <form method="dialog">, which works without invoker commands. */
  closeWith?: "command" | "form";
  title: string;
  text: string;
}) {
  return (
    <dialog
      id={id}
      className={className}
      closedby={closedby}
      aria-labelledby={`${id}-title`}
    >
      <header data-slot="header">
        <p id={`${id}-title`} className="font-semibold">
          {title}
        </p>
      </header>
      <div data-slot="content">
        <p className="text-sm">{text}</p>
      </div>
      {closeWith === "form" ?
        <form method="dialog" data-slot="footer" className="flex justify-end">
          <button className="btn-ghost/surface">Close</button>
        </form>
      : <footer data-slot="footer" className="flex justify-end">
          <button className="btn-ghost/surface" commandfor={id} command="close">
            Close
          </button>
        </footer>
      }
    </dialog>
  );
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
  );
}

function GlanceFrame({
  label,
  children,
}: {
  label: string;
  children: ShowcaseJsxNode;
}) {
  return (
    <div className="space-y-2">
      <span className="bg-surface-50/80 text-on-surface-50/70 inline-flex rounded px-2 py-1 font-mono text-xs">
        {label}
      </span>
      <div className="border-surface-300/40 relative h-56 overflow-hidden rounded-xl border bg-black/50">
        {children}
      </div>
    </div>
  );
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
  );
}
