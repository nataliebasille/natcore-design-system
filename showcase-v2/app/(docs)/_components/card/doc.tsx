/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import {
  atAGlanceShowcase,
  hoverShowcase,
  slotShowcase,
  variantShowcase,
} from "./showcases";

export default {
  title: "Card",
  description:
    "Sectioned content containers with variant-driven tone styling and an optional hover modifier. Mark child sections with data-slot attributes to inherit the card layout structure.",
  atAGlance: atAGlanceShowcase(),
  components: {
    card: {
      name: "Card",
      description:
        "Applies the card container styling using the selected variant and tone palette. Child sections opt into the built-in layout using documented slots.",
      showcases: [
        {
          title: "Solid",
          content: variantShowcase("solid"),
        },
        {
          title: "Soft",
          content: variantShowcase("soft"),
        },
        {
          title: "Outline",
          content: variantShowcase("outline"),
        },
        {
          title: "Ghost",
          content: variantShowcase("ghost"),
        },
      ],
    },
  },
  utilities: {
    hover: {
      name: "Hover Modifier",
      description:
        "Adds an interactive hover treatment by animating background, foreground, border color, and scale. Compose it with any card variant.",
      showcases: [
        {
          title: "Composed with variants",
          description:
            "Use card-hover alongside a variant class when the entire card surface should feel clickable.",
          content: hoverShowcase(),
        },
      ],
    },
  },
  slots: {
    title: "Card Slots",
    description:
      'Add data-slot="header", data-slot="content", and data-slot="footer" to child elements to apply the card section spacing and edge dividers.',
    showcases: [
      {
        title: "Structured content",
        description:
          "The slot attributes preserve the existing card section semantics while keeping the builder metadata explicit for generated docs.",
        content: slotShowcase(),
      },
    ],
  },
} satisfies Documentation<
  typeof import("../../../../../packages/core-v2/src/tailwind/components/card.css.ts").default
>;
