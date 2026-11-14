import { control, docsFor } from "@nataliebasille/css-engine";
import code from "./code.css.ts";

const { Page, Playground, Section, Example } = docsFor(code);

const SNIPPET = `const dialog = document.querySelector("dialog");
dialog.showModal();`;

const LONG_LINE = `const message = "This line is longer than the example, so the block scrolls sideways instead of wrapping.";`;

export default (
  <Page
    title="Code"
    description="Monospace code on the surface tone. Bare <code> elements are full-width blocks that keep whitespace and scroll sideways, and code-inline sets code in running text. Tailwind utilities override both without !."
    atAGlance={
      <div className="flex w-full flex-col gap-3 *:m-0">
        <code>{SNIPPET}</code>
        <p>
          Call <span className="code-inline">dialog.showModal()</span> to open
          it.
        </p>
      </div>
    }
  >
    <Playground
      controls={{
        variant: false,
        layout: control.select(["block", "inline"], {
          label: "Layout",
          optionLabels: {
            block: "Block (<code>)",
            inline: "Inline (code-inline)",
          },
        }),
        text: control.text({ default: "dialog.showModal()", label: "Code" }),
      }}
      render={(v) => {
        const text = v.text || "dialog.showModal()";

        return v.layout === "inline" ?
            <p className="m-0">
              Call <span className="code-inline">{text}</span> to open the
              dialog.
            </p>
          : <code>{text}</code>;
      }}
    />

    <Section
      of="code"
      description="A full-width monospace block on the surface 100 tone with rounded corners, at 0.875em of the surrounding text. Whitespace and line breaks are kept, and lines wider than the block scroll sideways. Bare <code> elements get it automatically; add the class to style another element the same way."
      vars={{
        "--display": "Display of the block. The default is block.",
        "--width": "Width of the block. The default is 100%.",
        "--padding": "Padding inside the block. The default is 1rem (4).",
        "--radius": "Corner radius. The default is --radius-md.",
      }}
    >
      <Example
        title="Code block"
        description="A bare <code> element, no classes needed."
      >
        <code>{SNIPPET}</code>
      </Example>

      <Example
        title="Long lines"
        description="Lines are never wrapped; the block scrolls sideways instead of stretching the page."
      >
        <code>{LONG_LINE}</code>
      </Example>
    </Section>

    <Section
      of="code@variant"
      title="Inline code"
      description="The inline variant turns code into a small chip inside a line of text: inline display, auto width, tight padding, and a smaller radius. It works with responsive modifiers, e.g. min-[48rem]:code-inline."
    >
      <Example title="In a sentence">
        <p className="m-0">
          Pass the <span className="code-inline">id</span> of the dialog to{" "}
          <span className="code-inline">commandfor</span>, and set{" "}
          <span className="code-inline">command</span> to{" "}
          <span className="code-inline">show-modal</span>.
        </p>
      </Example>
    </Section>
  </Page>
);
