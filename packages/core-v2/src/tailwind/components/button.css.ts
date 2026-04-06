import {
  component,
  dsl,
  theme,
  utility,
  type ThemeConstruct,
  type ComponentConstruct,
  type UtilityConstruct,
} from "@nataliebasille/css-engine";

const solid = {
  "--bg": dsl.current(800),
  "--fg": dsl.currentText(800),
  "--hover-bg": dsl.current(700),
  "--hover-fg": dsl.currentText(700),
  "--active-bg": dsl.current(500),
  "--active-fg": dsl.currentText(500),
  "--border-color": dsl.current(700),
} as const;
const soft = {
  "--bg": dsl.current(300),
  "--fg": dsl.currentText(300),
  "--hover-bg": dsl.current(200),
  "--hover-fg": dsl.currentText(200),
  "--active-bg": dsl.current(100),
  "--active-fg": dsl.currentText(100),
  "--border-color": dsl.current(300),
} as const;
const outline = {
  "--bg": dsl.cssvar("--tone-current-bg"),
  "--fg": dsl.cssvar("--tone-current-fg"),
  "--hover-bg": dsl.current(100, 0.4),
  "--hover-fg": dsl.currentText(100),
  "--active-bg": dsl.current(100),
  "--active-fg": dsl.currentText(100),
  "--border-color": dsl.current(500),
} as const;
const ghost = {
  "--bg": "transparent",
  "--fg": dsl.cssvar("--tone-current-fg"),
  "--hover-bg": dsl.current(500, 0.1),
  "--hover-fg": dsl.cssvar("--tone-current-fg"),
  "--border-color": "transparent",
  "--active-bg": dsl.current(500, 0.2),
  "--active-hover-fg": dsl.colorMix(
    "srgb",
    { color: dsl.cssvar("--tone-current-fg") },
    {
      color: dsl.current(800),
      percentage: dsl.primitive.percentage(90),
    },
  ),
  "--hover-border-color": dsl.current(500, 0.2),
  "--box-shadow-focus": dsl.cssv`0 0 0 3px ${dsl.cssvar("--color-gray-300")}`,
} as const;

const TOGGLES_SELECTOR = [
  "input[type='checkbox']",
  "input[type='radio']",
] as const;

const BUTTON_SIZE_DEFAULT = dsl.primitive.length.rem(1);

const x = component("btn-group", {
  defaultVariant: "outline",
  variants: {
    solid,
    soft,
    outline,
    ghost: {
      ...ghost,
      "--border-radius": dsl.cssvar("--radius-lg"),
      "--border-inline-width-first-child": dsl.primitive.length.px(1),
      "--border-inline-width-last-child": dsl.primitive.length.px(1),
      "--border-inline-width-not-first-last-child": dsl.primitive.length.px(1),
    },
  },
  styles: [
    "inline-flex",

    {
      $: {
        [TOGGLES_SELECTOR.join(", ")]: ["hidden"],

        ["& > *"]: [
          ...buttonStyles(),
          {
            $: {
              ["&:hover"]: {
                "background-color": dsl.match.variable("--hover-bg"),
                color: dsl.match.variable("--hover-fg"),
              },

              ["&:first-child"]: [
                "rounded-r-none",
                "border-r-0",
                {
                  "border-radius": dsl.match.variable("--border-radius"),
                  "border-inline-width": dsl.match.variable(
                    "--border-inline-width-first-child",
                  ),
                },
              ],
              ["&:last-child"]: [
                "rounded-l-none",
                "border-l-0",
                {
                  "border-radius": dsl.match.variable("--border-radius"),
                  "border-inline-width": dsl.match.variable(
                    "--border-inline-width-last-child",
                  ),
                },
              ],
              ["&:not(:first-child):not(:last-child)"]: [
                "rounded-none",
                "border-x-0",
                {
                  "border-radius": dsl.match.variable("--border-radius"),
                  "border-inline-width": dsl.match.variable(
                    "--border-inline-width-not-first-last-child",
                  ),
                },
              ],
              ["&:has(:checked)"]: {
                "background-color": dsl.match.variable("--active-bg"),
                color: dsl.match.variable("--active-fg"),
              },
            },
          },
        ],
      },
    },
  ],
});

const y = x.styles[0];

const module = [
  theme("inline", {
    "--btn-padding-inline": dsl.cssvar(
      "--btn-px-override",
      dsl.cssvar("--btn-px", dsl.cssvar("--btn-px-md")),
    ),

    "--btn-padding-block": dsl.cssvar(
      "--btn-py-override",
      dsl.cssvar("--btn-py", dsl.cssvar("--btn-py-md")),
    ),
  }),
  component("btn", {
    variants: {
      solid,
      soft,
      outline,
      ghost,
    },
    styles: [
      ...buttonStyles(),
      {
        $: {
          [dsl.select.parent(dsl.select.pseudo("active"))]: {
            transform: dsl.cssv`scale(${dsl.primitive.number(0.98)})`,
          },
        },
      },
    ],
  }),

  component("btn-group", {
    defaultVariant: "outline",
    variants: {
      solid,
      soft,
      outline,
      ghost: {
        ...ghost,
        "--border-radius": dsl.cssvar("--radius-lg"),
        "--border-inline-width-first-child": dsl.primitive.length.px(1),
        "--border-inline-width-last-child": dsl.primitive.length.px(1),
        "--border-inline-width-not-first-last-child":
          dsl.primitive.length.px(1),
      },
    },
    styles: [
      "inline-flex",

      {
        $: {
          [TOGGLES_SELECTOR.join(", ")]: ["hidden"],

          ["& > *"]: [
            ...buttonStyles(),
            {
              $: {
                ["&:hover"]: {
                  "background-color": dsl.match.variable("--hover-bg"),
                  color: dsl.match.variable("--hover-fg"),
                },

                ["&:first-child"]: [
                  "rounded-r-none",
                  "border-r-0",
                  {
                    "border-radius": dsl.match.variable("--border-radius"),
                    "border-inline-width": dsl.match.variable(
                      "--border-inline-width-first-child",
                    ),
                  },
                ],
                ["&:last-child"]: [
                  "rounded-l-none",
                  "border-l-0",
                  {
                    "border-radius": dsl.match.variable("--border-radius"),
                    "border-inline-width": dsl.match.variable(
                      "--border-inline-width-last-child",
                    ),
                  },
                ],
                ["&:not(:first-child):not(:last-child)"]: [
                  "rounded-none",
                  "border-x-0",
                  {
                    "border-radius": dsl.match.variable("--border-radius"),
                    "border-inline-width": dsl.match.variable(
                      "--border-inline-width-not-first-last-child",
                    ),
                  },
                ],
                ["&:has(:checked)"]: {
                  "background-color": dsl.match.variable("--active-bg"),
                  color: dsl.match.variable("--active-fg"),
                },
              },
            },
          ],
        },
      },
    ],
  }),

  utility(
    "btn-size",
    theme({
      "--btn-size-sm": dsl.primitive.length.rem(0.75),
      "--btn-size-md": BUTTON_SIZE_DEFAULT,
      "--btn-size-lg": dsl.primitive.length.rem(1.75),
    }),
    {
      "--btn-size": dsl.match.oneOf(
        dsl.match.variable("--btn-size"),
        dsl.match.arbitraryLength(),
      ),
    },
  ),

  utility(
    "btn-icon",
    {
      "--btn-px": dsl.calc`${dsl.cssvar("--btn-size")} * 0.5`,
      "--btn-py": dsl.calc`${dsl.cssvar("--btn-size")} * 0.5`,
    },

    "aspect-square",
    "rounded-full",
  ),
];

function buttonStyles() {
  return [
    "cursor-pointer",
    "rounded-lg",
    "border",
    "transition-all",
    "duration-250",
    "ease-in-out",

    {
      "--btn-size": BUTTON_SIZE_DEFAULT,
      "--btn-px": dsl.calc`${dsl.cssvar("--btn-size")} * 0.8`,
      "--btn-py": dsl.calc`${dsl.cssvar("--btn-size")} * 0.5`,
      "--btn-gap": dsl.calc`${dsl.cssvar("--btn-size")} * 0.2`,

      "font-size": dsl.cssvar("--btn-size"),
      "padding-inline": dsl.cssvar("--btn-px"),
      "padding-block": dsl.cssvar("--btn-py"),
      gap: dsl.cssvar("--btn-gap"),

      "background-color": dsl.match.variable(`--bg`),
      color: dsl.match.variable(`--fg`),
      "border-color": dsl.match.variable("--border-color"),

      $: {
        [dsl.select.parent(dsl.select.pseudo("hover"))]: {
          "background-color": dsl.match.variable(`--hover-bg`),
          color: dsl.match.variable(`--hover-fg`),
          "border-color": dsl.match.variable("--hover-border-color"),
        },
      },
    },
  ];
}

export default module;

export type CssTsContent =
  | ComponentConstruct<string, any, any>
  | UtilityConstruct<string, any, any>
  | ThemeConstruct<any, any>
  | dsl.StyleListAst
  | dsl.StyleRuleAst
  | dsl.AtRuleAst;

type ExtractComponents<T extends CssTsContent[]> = Extract<
  T[number],
  ComponentConstruct<string, any, any>
>;

type ExtractModifiers<T extends CssTsContent[]> = Extract<
  T[number],
  UtilityConstruct<string, any, any>
>;

// Finds all CSS variables that can be set externally to customize the module.
// NOT settable: ThemeConstructs (inline or utility-owned), component variants.
// SETTABLE: `--` keys found inside construct.styles.
//
// `[I in keyof Array]` is avoided because it maps over array method keys ("map",
// "filter", ...) causing TS to evaluate `ExtractVarsFromStyleBody<Function>`
// which blows up. Instead, `(infer E)[]` extracts only the element type so the
// conditional distributes cleanly. Style-rule bodies are not traversed — they are
// self-referential (StyleRuleBody includes StyleRuleAst) and only consume CSS vars,
// never declare them.
//
// Two plain-property cases exist because BodyBuilder_To_UtilityBody uses
// ListBuilder_To_StyleListAst for StyleListBuilder elements, which maps
// StyleProperties to plain objects WITHOUT a $ast wrapper. StyleRuleBodyBuilder
// elements do get a `{ $ast: "style-list"; styles: [...] }` wrapper, so we
// handle both shapes.
type ExtractVarsFromStyleBody<S> =
  S extends readonly (infer E)[] ? ExtractVarsFromStyleBody<E>
  : S extends { $ast: "style-list"; styles: readonly (infer P)[] } ?
    keyof P & `--${string}`
  : S extends { $ast: string } ?
    never // all AST nodes skipped — style-rule bodies are self-referential and only consume vars
  : S extends Record<string, unknown> ?
    keyof S & `--${string}` // raw StyleProperties plain objects
  : never;

type ExtractCssVarsFromElement<Item extends CssTsContent> =
  Item extends { styles: infer S extends any[] } ? ExtractVarsFromStyleBody<S>
  : never;

export type ExtractCssVars<T extends CssTsContent[]> =
  ExtractCssVarsFromElement<T[number]>;

type DocMeta<T extends CssTsContent[]> = {
  description: string;
  components: Record<ExtractComponents<T>["name"], string>;
  modifiers: Record<ExtractModifiers<T>["name"], string>;
  cssvars: Record<ExtractCssVars<T>, string>;
};
export const docs: DocMeta<typeof module> = {
  components: {
    btn: "The base button component with multiple variants and sizes.",
  },
  modifiers: {
    "btn-size": "Utility for setting the button size.",
    "btn-icon": "Utility for setting the button icon.",
  },
  cssvars: {
    "--btn-size": "The size of the button.",
    "--btn-px": "The horizontal padding of the button.",
    "--btn-py": "The vertical padding of the button.",
  },
};
