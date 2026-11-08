import { component, dsl } from "@nataliebasille/css-engine";

const { child, cls, compound, descendant, element, list, parent, pseudo } =
  dsl.select;

/**
 * Long-form text spacing for paragraphs, list items, and headings. Bare
 * `<article>` gets the class. Everything lands in the components layer, so
 * Tailwind utilities on the children (`m-0`, `leading-tight`, …) override it.
 */
export default component("article")
  .body({
    $: {
      [list(within(element("p")), within(cls("list-item")))]: [
        "leading-relaxed",
      ],
      [within(element("p"))]: {
        margin: `${dsl.spacing("4")} 0`,
      },
      [list(
        within(element("h1")),
        within(element("h2")),
        within(element("h3")),
      )]: {
        margin: `${dsl.spacing("8")} 0 ${dsl.spacing("4")} 0`,
      },
      [list(
        ...(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((h) =>
          within(element(h)),
        ),
      )]: {
        color: dsl.cssvar("--tone-current-fg"),
      },
      // Last and more specific than `& h1`, so it wins over the heading margins.
      [child(parent(), compound("*", pseudo("first-child")))]: ["mt-0"],
    },
  })
  .applyTo(element("article"));

/** `& <selector>`: a descendant of the article. */
function within<S extends string>(selector: S) {
  return descendant(parent(), selector);
}
