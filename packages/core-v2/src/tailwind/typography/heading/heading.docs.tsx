import { control, docsFor } from "@nataliebasille/css-engine";
import heading from "./heading.css.ts";

const { Page, Playground, Section, Example } = docsFor(heading);

// Written out so Tailwind's source scan generates every playground class.
const HEADING_CLASSES = {
  "1": "heading-1",
  "2": "heading-2",
  "3": "heading-3",
  "4": "heading-4",
  "5": "heading-5",
  "6": "heading-6",
} as const;

export default (
  <Page
    title="Heading"
    description="Type scale for headings. Bare <h1>–<h6> elements are sized automatically, and heading-1 … heading-6 apply the same sizes to any element. Tailwind text, leading, tracking, and spacing utilities override them without !."
    atAGlance={
      <div className="flex w-full flex-col gap-2 *:m-0">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
      </div>
    }
  >
    <Playground
      controls={{
        element: control.select(["heading", "class"], {
          label: "Markup",
          optionLabels: {
            heading: "Heading element (<hN>)",
            class: "Class on a paragraph (heading-N)",
          },
        }),
        variant: { label: "Level", default: "2" },
        text: control.text("The quick brown fox"),
      }}
      render={(v) => {
        const text = v.text || "The quick brown fox";

        if (v.element === "class") {
          return <p className={HEADING_CLASSES[v.variant]}>{text}</p>;
        }

        const Heading = `h${v.variant}` as const;
        return <Heading>{text}</Heading>;
      }}
    />

    <Section
      of="heading"
      description="Sets the font size for a level (1 is largest, 6 smallest) with wide tracking and tight leading. <h1>–<h6> get the matching level automatically."
    >
      <Example
        title="All levels"
        description="Bare heading elements, no classes needed."
        table={[
          { label: "h1 / heading-1", content: "text-5xl (3rem)" },
          { label: "h2 / heading-2", content: "text-3xl (1.875rem)" },
          { label: "h3 / heading-3", content: "text-xl (1.25rem)" },
          { label: "h4 / heading-4", content: "text-lg (1.125rem)" },
          { label: "h5 / heading-5", content: "text-base (1rem)" },
          { label: "h6 / heading-6", content: "text-sm (0.875rem)" },
        ]}
      >
        <ui-div className="flex w-full flex-col gap-2 *:m-0">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
        </ui-div>
      </Example>
    </Section>

    <Section
      title="On any element"
      description="Use heading-* when text should look like a heading without changing the document outline, or when a heading element needs a different visual level."
    >
      <Example title="Heading sizes on other elements">
        <ui-div className="flex w-full flex-col gap-2 *:m-0">
          <p className="heading-2">A paragraph styled like an h2</p>
          <h2 className="heading-4">An h2 styled like an h4</h2>
        </ui-div>
      </Example>
    </Section>
  </Page>
);
