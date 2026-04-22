/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

export default {
  title: "Badge",
  description:
    "Compact status labels for tags, counts, and inline metadata. Pick a variant and palette, then drop the badge alongside other UI without extra setup.",
  atAGlance: (
    <ui-div className="flex flex-wrap items-center gap-2">
      <span className="badge-solid/primary">New</span>
      <span className="badge-soft/secondary">Beta</span>
      <span className="badge-outline/accent">Draft</span>
      <span className="badge-ghost/surface">Muted</span>
    </ui-div>
  ),
  components: {
    badge: {
      name: "Badge",
      description:
        "Applies compact pill styling using the selected variant and tone palette.",
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
  cssvars: {
    "--bg": "Background color resolved by the selected badge variant.",
    "--fg": "Foreground text color resolved by the selected badge variant.",
    "--border": "Border color resolved by the selected badge variant.",
  },
} satisfies Documentation<
  typeof import("../../../../../packages/core-v2/src/tailwind/components/badge.css.ts").default
>;

function variantShowcase(variant: "solid" | "soft" | "outline" | "ghost") {
  const classes = {
    solid: {
      primary: "badge-solid/primary",
      secondary: "badge-solid/secondary",
      accent: "badge-solid/accent",
      surface: "badge-solid/surface",
    },
    soft: {
      primary: "badge-soft/primary",
      secondary: "badge-soft/secondary",
      accent: "badge-soft/accent",
      surface: "badge-soft/surface",
    },
    outline: {
      primary: "badge-outline/primary",
      secondary: "badge-outline/secondary",
      accent: "badge-outline/accent",
      surface: "badge-outline/surface",
    },
    ghost: {
      primary: "badge-ghost/primary",
      secondary: "badge-ghost/secondary",
      accent: "badge-ghost/accent",
      surface: "badge-ghost/surface",
    },
  };

  return (
    <ui-div className="flex w-full flex-wrap items-center gap-3">
      <span className={classes[variant].primary}>Primary</span>
      <span className={classes[variant].secondary}>Secondary</span>
      <span className={classes[variant].accent}>Accent</span>
      <span className={classes[variant].surface}>Surface</span>
    </ui-div>
  );
}
