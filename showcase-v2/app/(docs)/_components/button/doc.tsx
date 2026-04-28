/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import { uiAttr } from "@nataliebasille/preview-jsx-runtime/jsx-runtime";

export default {
  title: "Button",
  description:
    "Composable button utilities: pick a variant, a tone, and a size. Everything else (hover, focus, active) is built in.",
  atAGlance: (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn-solid/primary">Solid</button>
      <button className="btn-soft/secondary">Soft</button>
      <button className="btn-outline/accent">Outline</button>
      <button className="btn-ghost/surface">Ghost</button>
      <button className="btn-soft/surface btn-size-sm">Small</button>
      <button className="btn-soft/secondary btn-size-lg">Large</button>
    </div>
  ),
  components: {
    btn: {
      name: "Button",
      description:
        "Applies button styling using the selected variant and tone palette.",
      showcases: [
        {
          title: "Solid",
          content: (
            <ui-div className="flex w-full flex-wrap gap-3">
              <button className="btn-solid/primary">Primary</button>
              <button className="btn-solid/secondary">Secondary</button>
              <button className="btn-solid/accent">Accent</button>
              <button className="btn-solid/surface">Surface</button>
            </ui-div>
          ),
        },

        {
          title: "Soft",
          content: (
            <ui-div className="flex w-full flex-wrap gap-3">
              <button className="btn-soft/primary">Primary</button>
              <button className="btn-soft/secondary">Secondary</button>
              <button className="btn-soft/accent">Accent</button>
              <button className="btn-soft/surface">Surface</button>
            </ui-div>
          ),
        },

        {
          title: "Outline",
          content: (
            <ui-div className="flex w-full flex-wrap gap-3">
              <button className="btn-outline/primary">Primary</button>
              <button className="btn-outline/secondary">Secondary</button>
              <button className="btn-outline/accent">Accent</button>
              <button className="btn-outline/surface">Surface</button>
            </ui-div>
          ),
        },

        {
          title: "Ghost",
          content: (
            <ui-div className="flex w-full flex-wrap gap-3">
              <button className="btn-ghost/primary">Primary</button>
              <button className="btn-ghost/secondary">Secondary</button>
              <button className="btn-ghost/accent">Accent</button>
              <button className="btn-ghost/surface">Surface</button>
            </ui-div>
          ),
        },
      ],
    },

    group: {
      name: "Button Group",
      description:
        "Groups adjacent buttons into a visually connected row sharing a variant style and tone palette.",
      showcases: [
        {
          title: "Solid",
          content: (
            <div className="btn-group-solid/primary">
              {buttonGroupContents("solid")}
            </div>
          ),
        },
        {
          title: "Soft",
          content: (
            <div className="btn-group-soft/primary">
              {buttonGroupContents("soft")}
            </div>
          ),
        },
        {
          title: "Outline",
          content: (
            <div className="btn-group-outline/primary">
              {buttonGroupContents("outline")}
            </div>
          ),
        },
        {
          title: "Ghost",
          content: (
            <div className="btn-group-ghost/primary">
              {buttonGroupContents("ghost")}
            </div>
          ),
        },
      ],
    },
  },

  utilities: {
    size: {
      name: "Sizes",
      description:
        "Controls the padding and font size of a button. Composes with any btn variant.",
      showcases: [
        {
          title: "Preset Sizes",
          description:
            "Use sm, md, or lg to apply one of the three built-in size presets.",
          content: (
            <ui-div className="flex w-full flex-wrap items-center gap-3">
              <button className="btn-solid/primary btn-size-sm">Small</button>
              <button className="btn-solid/primary btn-size-md">Medium</button>
              <button className="btn-solid/primary btn-size-lg">Large</button>
            </ui-div>
          ),
        },
        {
          title: "Arbitrary Size",
          description:
            "Pass any CSS length in square brackets to set a custom size.",
          content: (
            <ui-div className="flex w-full flex-wrap items-center gap-3">
              <button className="btn-solid/primary btn-size-[0.625rem]">
                0.625rem
              </button>
              <button className="btn-solid/primary btn-size-[1rem]">
                1rem
              </button>
              <button className="btn-solid/primary btn-size-[1.5rem]">
                1.5rem
              </button>
            </ui-div>
          ),
        },
        {
          title: "Override via CSS Variable",
          description:
            "Set --btn-size directly as a CSS variable utility to control size dynamically.",
          content: (
            <ui-div className="flex w-full flex-wrap items-center gap-3">
              <button className="btn-solid/primary [--btn-size:0.75rem]">
                0.75rem
              </button>
              <button className="btn-solid/primary [--btn-size:1rem]">
                1rem
              </button>
              <button className="btn-solid/primary [--btn-size:1.25rem]">
                1.25rem
              </button>
            </ui-div>
          ),
        },
      ],
    },
    icon: {
      name: "Icon Buttons",
      description:
        "Modifier utility to create square, fully-rounded icon buttons by equalizing inline and block padding. Composes with any btn variant and size.",
      showcases: [
        {
          content: (
            <ui-div className="flex w-full flex-wrap gap-3">
              <button
                className="btn-icon btn-solid/primary"
                {...uiAttr({
                  "aria-label": "outline icon button",
                })}
              >
                <ui>
                  <AlertCircleIcon />
                </ui>

                <markup>{"<!-- icon svg -->"}</markup>
              </button>

              <button
                className="btn-icon btn-soft/primary"
                {...uiAttr({
                  "aria-label": "soft icon button",
                })}
              >
                <ui>
                  <AlertCircleIcon />
                </ui>

                <markup>{"<!-- icon svg -->"}</markup>
              </button>

              <button
                className="btn-icon btn-outline/primary"
                {...uiAttr({
                  "aria-label": "outline icon button",
                })}
              >
                <ui>
                  <AlertCircleIcon />
                </ui>

                <markup>{"<!-- icon svg -->"}</markup>
              </button>

              <button
                className="btn-icon btn-ghost/primary"
                {...uiAttr({
                  "aria-label": "ghost icon button",
                })}
              >
                <ui>
                  <AlertCircleIcon />
                </ui>

                <markup>{"<!-- icon svg -->"}</markup>
              </button>
            </ui-div>
          ),
        },
      ],
    },
  },
  cssvars: {
    "--px":
      "Inline (horizontal) padding. Override to decouple from --btn-size.",
    "--py": "Block (vertical) padding. Override to decouple from --btn-size.",
    "--gap": "Gap between content elements (e.g. icon + label).",
  },
} satisfies Documentation<
  typeof import("../../../../../packages/core-v2/src/tailwind/components/button.css.ts").default
>;

function AlertCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

function buttonGroupContents(type: string) {
  return (
    <>
      <label>
        <input type="radio" name={`button-group-${type}`} checked />
        First
      </label>
      <label>
        <input type="radio" name={`button-group-${type}`} />
        Second
      </label>
      <label>
        <input type="radio" name={`button-group-${type}`} />
        Third
      </label>
    </>
  );
}
