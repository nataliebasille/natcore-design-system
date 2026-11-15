import { control, docsFor } from "@nataliebasille/css-engine";
import article from "./article.css.ts";

const { Page, Playground, Section, Example } = docsFor(article);

export default (
  <Page
    title="Article"
    description="Long-form text spacing for paragraphs, list items, and headings. Bare <article> elements get it automatically, and the article class applies it to any element. Tailwind utilities on the children override it without !."
    atAGlance={
      <article className="w-full">
        <h2>Release notes</h2>
        <p>Typography is now overridable with plain Tailwind utilities.</p>
        <h3>What changed</h3>
        <p>Article and heading styles moved into the components layer.</p>
      </article>
    }
  >
    <Playground
      controls={{
        element: control.select(["article", "class"], {
          label: "Markup",
          optionLabels: {
            article: "<article> element",
            class: "article class on a <div>",
          },
        }),
        title: control.text("Getting started"),
      }}
      render={(v) => {
        const content = (
          <>
            <h2>{v.title || "Getting started"}</h2>
            <p>
              Paragraphs are spaced and use a relaxed line height. Headings get
              extra space above them to separate sections.
            </p>
            <h3>Next steps</h3>
            <p>Add Tailwind utilities to any child to override its spacing.</p>
          </>
        );

        return v.element === "class" ?
            <div className="article w-full">{content}</div>
          : <article className="w-full">{content}</article>;
      }}
    />

    <Section
      of="article"
      description="Spaces and colors the content inside it. <article> elements get the article class automatically."
    >
      <Example
        title="A typical article"
        table={[
          {
            label: "p",
            content: "1rem (4) margin above and below; relaxed line height.",
          },
          {
            label: "h1, h2, h3",
            content: "2rem (8) margin above, 1rem (4) below.",
          },
          { label: "h1 – h6", content: "Text color from the current tone." },
          { label: ".list-item", content: "Relaxed line height." },
          { label: "First child", content: "No top margin." },
        ]}
      >
        <article className="w-full">
          <h2>Getting started</h2>
          <p>
            Install the package, import the stylesheet, and start using the
            classes. Paragraphs are spaced and use a relaxed line height for
            comfortable reading.
          </p>
          <h3>Next steps</h3>
          <p>Headings get extra space above them to separate sections.</p>
          <ul>
            <li className="list-item">
              List items use the same relaxed line height.
            </li>
            <li className="list-item">
              The first child never adds space at the top.
            </li>
          </ul>
        </article>
      </Example>
    </Section>

    <Section
      title="On any element"
      description="To apply article styles to content that shouldn't be an <article> element, such as a post body inside a card or a div rendered by a CMS, add the article class to its container."
    >
      <Example title="The article class on a div">
        <div className="article w-full">
          <h3>Post title</h3>
          <p>
            The article class gives any element the same spacing as an article
            element.
          </p>
          <p>Use it when the semantic element would be wrong.</p>
        </div>
      </Example>
    </Section>
  </Page>
);
