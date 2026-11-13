import { describe, expect, expectTypeOf, it } from "vitest";
import {
  renderToMarkup,
  type ShowcaseJsxNode,
} from "@nataliebasille/preview-jsx-runtime";
import { component } from "../components/component-builder.ts";
import { dsl, PALETTE } from "../../dsl/public.ts";
import {
  control,
  docs,
  docsFor,
  playgroundDefaults,
  resolveDocLocation,
  toDocModel,
  type DocModel,
  type DocPlaygroundBlock,
  type DocSectionBlock,
  type PlaygroundValues,
} from "./public.ts";

const SIZE_DEFAULT = dsl.primitive.length.rem(1);

const btn = component("btn")
  .vars({
    "--size": SIZE_DEFAULT,
    "--px": dsl.primitive.length.rem(0.8),
  })
  .controlled(
    "--size",
    {
      sm: dsl.primitive.length.rem(0.75),
      md: SIZE_DEFAULT,
      lg: dsl.primitive.length.rem(1.25),
    },
    dsl.match.arbitrary.length(),
  )
  .variant("solid", { "--bg": dsl.current(800) })
  .variant("soft", { "--bg": dsl.current(300) })
  .defaultVariant("soft")
  .body({
    "background-color": dsl.cssvar("--bg"),
    "font-size": dsl.cssvar("--size"),
    "padding-inline": dsl.cssvar("--px"),
  })
  .utility("icon", "aspect-square");

const panel = component("panel")
  .slot("header")
  .guard("open", dsl.select.attr("open"))
  .body({ display: "block" });

describe("docsFor typing", () => {
  const { Section, Playground } = docsFor(btn);

  it("Section `of` accepts component and utility keys", () => {
    void (<Section of="btn" />);
    void (<Section of="icon" />);
    void (<Section of="size" />);
    // @ts-expect-error unknown key
    void (<Section of="icn" />);
  });

  it("a Section without `of` requires a title", () => {
    void (<Section title="Overriding with Tailwind" />);
    // @ts-expect-error title is required when there is no `of`
    void (<Section />);
  });

  it("Section `vars` keys are the builder's CSS vars", () => {
    void (<Section of="btn" vars={{ "--px": "Inline padding." }} />);
    // @ts-expect-error unknown var
    void (<Section of="btn" vars={{ "--pxx": "x" }} />);
  });

  it("`@slots` and `@custom-variants` exist only when the builder has them", () => {
    const panelDocs = docsFor(panel);
    void (<panelDocs.Section of="@slots" />);
    void (<panelDocs.Section of="@custom-variants" />);
    // @ts-expect-error btn has no slots
    void (<Section of="@slots" />);
    // @ts-expect-error btn has no guards
    void (<Section of="@custom-variants" />);
  });

  it("Playground values are derived from the builder", () => {
    expectTypeOf<PlaygroundValues<typeof btn>>().toEqualTypeOf<{
      variant: "solid" | "soft";
      size: "sm" | "md" | "lg";
    }>();
  });

  it("Playground values include custom controls and drop hidden ones", () => {
    void (
      <Playground
        controls={{
          size: false,
          palette: control.palette(["primary", "accent"]),
          label: control.text("Button"),
          rounded: control.boolean(),
          as: control.select(["button", "a"]),
        }}
        render={(v) => {
          expectTypeOf(v).toEqualTypeOf<{
            variant: "solid" | "soft";
            palette: "primary" | "accent";
            label: string;
            rounded: boolean;
            as: "button" | "a";
          }>();
          return <button />;
        }}
      />
    );
  });

  it("an override's default must be one of its options", () => {
    void (
      <Playground
        controls={{ size: { options: ["sm", "md"], default: "md" } }}
        render={() => <button />}
      />
    );
    void (
      <Playground
        // @ts-expect-error "lg" is not one of the narrowed options
        controls={{ size: { options: ["sm", "md"], default: "lg" } }}
        render={() => <button />}
      />
    );
  });

  it("derived control overrides only accept that control's values", () => {
    void (
      <Playground
        controls={{ variant: { options: ["solid"], label: "Style" } }}
        render={() => <button />}
      />
    );
    void (
      <Playground
        // @ts-expect-error "ghost" is not a btn variant
        controls={{ variant: { options: ["ghost"] } }}
        render={() => <button />}
      />
    );
  });

  it("control helpers' config form keeps the values narrowed", () => {
    void (
      <Playground
        controls={{
          closedby: control.select(["any", "closerequest", "none"], {
            default: "any",
            label: "Dismissal (closedby)",
            optionLabels: { closerequest: "Esc only" },
          }),
          palette: control.palette(["primary", "secondary"], {
            default: "secondary",
            label: "Tone",
            optionLabels: { primary: "Brand" },
          }),
          thumb: control.boolean({ label: "Thumb", onLabel: "Custom" }),
          text: control.text({ default: "Overview", label: "Label" }),
        }}
        render={(v) => {
          expectTypeOf(v).toEqualTypeOf<{
            variant: "solid" | "soft";
            size: "sm" | "md" | "lg";
            closedby: "any" | "closerequest" | "none";
            palette: "primary" | "secondary";
            thumb: boolean;
            text: string;
          }>();
          return <button />;
        }}
      />
    );
  });

  it("a config's default must be one of the options", () => {
    // @ts-expect-error "c" is not one of the options
    void control.select(["a", "b"], { default: "c" });
    // @ts-expect-error "accent" is not one of the palettes listed
    void control.palette(["primary"], { default: "accent" });
  });

  it("optionLabels only accepts the control's options", () => {
    // @ts-expect-error "c" is not one of the options
    void control.select(["a", "b"], { optionLabels: { c: "C" } });
    // @ts-expect-error "accent" is not one of the palettes listed
    void control.palette(["primary"], { optionLabels: { accent: "A" } });
    void (
      <Playground
        controls={{ variant: { optionLabels: { solid: "Solid fill" } } }}
        render={() => <button />}
      />
    );
    void (
      <Playground
        // @ts-expect-error "ghost" is not a btn variant
        controls={{ variant: { optionLabels: { solid: "S", ghost: "G" } } }}
        render={() => <button />}
      />
    );
    void (
      <Playground
        // @ts-expect-error "lg" was narrowed out of the options
        controls={{ size: { options: ["sm"], optionLabels: { lg: "L" } } }}
        render={() => <button />}
      />
    );
  });

  it("docs() (no builder) only allows titled sections and custom controls", () => {
    const guide = docs();
    void (<guide.Section title="Install" />);
    // @ts-expect-error guides have no builder keys
    void (<guide.Section of="btn" />);
    void (
      <guide.Playground
        controls={{ text: control.text("x") }}
        render={(v) => {
          expectTypeOf(v).toEqualTypeOf<{ text: string }>();
          return <p />;
        }}
      />
    );
  });
});

describe("toDocModel", () => {
  it("reads the page title, description, and at-a-glance content", () => {
    const { Page } = docsFor(btn);
    const model = toDocModel(
      <Page
        title="Button"
        description="Buttons."
        atAGlance={<button className="btn-solid">Hi</button>}
      />,
    );

    expect(model.title).toBe("Button");
    expect(model.description).toBe("Buttons.");
    expect(renderToMarkup(model.atAGlance)).toBe(
      '<button class="btn-solid">Hi</button>',
    );
    expect(model.blocks).toEqual([]);
  });

  it("keeps sections in authoring order with their examples and prose", () => {
    const { Page, Section, Example } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Section title="First">
          <p>Intro.</p>
          <Example
            title="Solid"
            description="Filled."
            table={[{ label: "a", content: "b" }]}
          >
            <button className="btn-solid">Solid</button>
          </Example>
        </Section>
        <Section title="Second" />
      </Page>,
    );

    const sections = sectionsOf(model);
    expect(sections.map((b) => b.title)).toEqual(["First", "Second"]);
    const [prose, example] = sections[0]?.content ?? [];
    expect(prose?.kind).toBe("prose");
    expect(prose?.kind === "prose" && renderToMarkup(prose.node)).toBe(
      "<p>Intro.</p>",
    );
    expect(example).toMatchObject({
      kind: "example",
      title: "Solid",
      description: "Filled.",
      table: [{ label: "a", content: "b" }],
    });
    expect(example?.kind === "example" && renderToMarkup(example.source)).toBe(
      '<button class="btn-solid">Solid</button>',
    );
  });

  it("writes React's htmlFor as for in an example's copyable markup", () => {
    const { Page, Section, Example } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Section title="Labels">
          <Example>
            <label htmlFor="toggle" className="btn-solid">
              Toggle
            </label>
          </Example>
        </Section>
      </Page>,
    );

    const [example] = sectionsOf(model)[0]?.content ?? [];
    expect(example?.kind === "example" && renderToMarkup(example.source)).toBe(
      '<label for="toggle" class="btn-solid">Toggle</label>',
    );
  });

  it("attaches the builder entity to a keyed section and uses its title", () => {
    const { Page, Section } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Section of="btn" description="Applies button styling." />
        <Section of="size" title="Sizes" description="Controls the size." />
        <Section of="icon" />
      </Page>,
    );

    const [root, size, icon] = sectionsOf(model);
    expect(root).toMatchObject({
      title: "Button",
      of: "btn",
      entityKind: "component",
      description: "Applies button styling.",
    });
    expect(root?.entity?.pattern.root).toBe("btn");
    expect(size).toMatchObject({ title: "Sizes", entityKind: "utility" });
    expect(size?.entity?.pattern.root).toBe("btn-size");
    expect(icon).toMatchObject({ title: "Icon", entityKind: "utility" });
  });

  it("builds the API reference with descriptions taken from sections and vars", () => {
    const { Page, Section } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Section
          of="btn"
          description="Applies button styling."
          vars={{ "--px": "Inline padding." }}
        />
      </Page>,
    );

    expect(model.api?.components["btn"]).toMatchObject({
      name: "Button",
      description: "Applies button styling.",
    });
    // Undocumented entries still appear, just without a description.
    expect(model.api?.utilities["icon"]).toMatchObject({ description: "" });
    expect(model.api?.cssvars).toContainEqual(
      expect.objectContaining({
        varName: "--btn-px",
        description: "Inline padding.",
      }),
    );
  });

  it("supports @slots and @custom-variants sections", () => {
    const { Page, Section } = docsFor(panel);
    const model = toDocModel(
      <Page title="Panel" description="Panels.">
        <Section of="@slots" description="Slot parts." />
        <Section of="@custom-variants" />
      </Page>,
    );

    const [slots, variants] = sectionsOf(model);
    expect(slots).toMatchObject({
      entityKind: "slots",
      title: "Header Slot",
      description: "Slot parts.",
    });
    expect(slots?.derived?.entries).toEqual([
      { name: "header", selector: '[data-slot="header"]' },
    ]);
    expect(variants).toMatchObject({
      entityKind: "custom-variants",
      title: "Custom Variants",
    });
    expect(model.api?.slots?.description).toBe("Slot parts.");
  });

  it("resolves playground controls: derived first, then custom, with overrides", () => {
    const { Page, Playground } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Playground
          controls={{
            variant: { label: "Style" },
            palette: control.palette(["primary", "accent"]),
            label: control.text("Button"),
            rounded: control.boolean(true),
          }}
          render={(v) => (
            <button className={`btn-${v.variant}`}>{v.label}</button>
          )}
        />
      </Page>,
    );

    const playground = playgroundOf(model);

    expect(playground.controls).toEqual([
      {
        name: "variant",
        label: "Style",
        kind: "select",
        options: ["solid", "soft"],
        optionLabels: { solid: "solid", soft: "soft" },
        default: "soft",
      },
      {
        name: "size",
        label: "Size",
        kind: "select",
        options: ["sm", "md", "lg"],
        optionLabels: { sm: "sm", md: "md", lg: "lg" },
        default: "md",
      },
      {
        name: "palette",
        label: "Palette",
        kind: "select",
        options: ["primary", "accent"],
        optionLabels: { primary: "primary", accent: "accent" },
        default: "primary",
      },
      { name: "label", label: "Label", kind: "text", default: "Button" },
      {
        name: "rounded",
        label: "Rounded",
        kind: "boolean",
        default: true,
        offLabel: "Off",
        onLabel: "On",
      },
    ]);

    const defaults = playgroundDefaults(playground.controls);
    expect(defaults).toEqual({
      variant: "soft",
      size: "md",
      palette: "primary",
      label: "Button",
      rounded: true,
    });
    expect(renderToMarkup(playground.render(defaults))).toBe(
      '<button class="btn-soft">Button</button>',
    );
  });

  it("falls back to the first option when an override's default isn't one of them", () => {
    const { Page, Playground } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Playground
          // @ts-expect-error simulates an untyped default outside the options
          controls={{ size: { options: ["sm", "md"], default: "lg" } }}
          render={() => <button />}
        />
      </Page>,
    );

    expect(playgroundOf(model).controls).toContainEqual(
      expect.objectContaining({
        name: "size",
        options: ["sm", "md"],
        default: "sm",
      }),
    );
    expect(model.issues).toEqual([
      'Playground control "size" defaults to "lg", which is not one of its options; using "sm".',
    ]);
  });

  it("hides a derived control set to false and narrows options", () => {
    const { Page, Playground } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Playground
          controls={{ size: false, variant: { options: ["solid"] } }}
          render={() => <button />}
        />
      </Page>,
    );

    const playground = playgroundOf(model);
    expect(playground.controls).toEqual([
      {
        name: "variant",
        label: "Variant",
        kind: "select",
        options: ["solid"],
        optionLabels: { solid: "solid" },
        default: "solid",
      },
    ]);
  });

  it("control.palette() defaults to every palette", () => {
    expect(control.palette()).toMatchObject({
      kind: "select",
      options: [...PALETTE],
      default: "primary",
    });
  });

  it("works without a builder for guide pages", () => {
    const { Page, Section, Example } = docs();
    const model = toDocModel(
      <Page title="Installation" description="Install it.">
        <p>Lead.</p>
        <Section title="Install">
          <Example>
            <code>pnpm add x</code>
          </Example>
        </Section>
      </Page>,
    );

    expect(model.api).toBeUndefined();
    expect(model.blocks.map((b) => b.kind)).toEqual(["prose", "section"]);
  });

  it("reports no issues for a valid page", () => {
    const { Page, Section } = docsFor(btn);
    expect(
      toDocModel(
        <Page title="Button" description="Buttons.">
          <Section of="btn" />
        </Page>,
      ).issues,
    ).toEqual([]);
  });

  describe("authoring mistakes are reported as issues, not thrown", () => {
    const { Page, Section, Example, Playground } = docsFor(btn);

    it("needs a Page at the root", () => {
      expect(toDocModel(<Section title="x" />)).toEqual({
        title: "",
        description: "",
        blocks: [],
        issues: ["A docs file must export a <Page> as its default export."],
      });
    });

    it("skips an Example outside a Section", () => {
      const model = toDocModel(
        <Page title="B" description="d">
          <Example>
            <p />
          </Example>
        </Page>,
      );

      expect(model.issues).toEqual(["<Example> must be inside a <Section>."]);
      expect(model.blocks).toEqual([]);
    });

    it("skips nested Sections", () => {
      const model = toDocModel(
        <Page title="B" description="d">
          <Section title="a">
            <Section title="b" />
          </Section>
        </Page>,
      );

      expect(model.issues).toEqual([
        "<Section> must be a direct child of <Page>.",
      ]);
      expect(model.blocks).toMatchObject([{ title: "a", content: [] }]);
    });

    it("keeps only the first Playground", () => {
      const model = toDocModel(
        <Page title="B" description="d">
          <Playground render={() => <p />} />
          <Playground render={() => <p />} />
        </Page>,
      );

      expect(model.issues).toEqual([
        "A page can have only one <Playground>; extras are ignored.",
      ]);
      expect(model.blocks.map((b) => b.kind)).toEqual(["playground"]);
    });

    it("renders a Section with an unknown `of` as a plain section", () => {
      const model = toDocModel(
        <Page title="B" description="d">
          {/* @ts-expect-error simulates a key the builder no longer has */}
          <Section of="nope" />
        </Page>,
      );

      expect(model.issues).toEqual([
        '<Section of="nope"> does not match anything in "btn".',
      ]);
      expect(model.blocks).toMatchObject([{ kind: "section", title: "nope" }]);
    });
  });
});

function sectionsOf(model: DocModel) {
  return model.blocks.filter(
    (block): block is DocSectionBlock => block.kind === "section",
  );
}

function playgroundOf(model: DocModel): DocPlaygroundBlock {
  const playground = model.blocks.find(
    (block): block is DocPlaygroundBlock => block.kind === "playground",
  );
  expect(playground).toBeDefined();
  return playground ?? { kind: "playground", controls: [], render: () => null };
}

describe("empty option lists", () => {
  const { Page, Playground } = docsFor(btn);

  it("are type errors", () => {
    // @ts-expect-error a select needs at least one option
    void control.select([]);
    // @ts-expect-error a palette select needs at least one option
    void control.palette([]);
    void (
      <Playground
        // @ts-expect-error an override needs at least one option
        controls={{ size: { options: [] } }}
        render={() => <button />}
      />
    );
  });

  it("fall back to a derived control's own options and report an issue", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Playground
          // @ts-expect-error simulates an untyped empty list
          controls={{ size: { options: [] } }}
          render={() => <button />}
        />
      </Page>,
    );

    expect(playgroundOf(model).controls).toContainEqual(
      expect.objectContaining({
        name: "size",
        options: ["sm", "md", "lg"],
        default: "md",
      }),
    );
    expect(model.issues).toEqual([
      'Playground control "size" has no options; using the component\'s options.',
    ]);
  });

  it("omit the playground when a custom select has no options", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Playground
          // @ts-expect-error simulates an untyped empty list
          controls={{ tone: control.select([]) }}
          render={() => <button />}
        />
      </Page>,
    );

    expect(model.blocks).toEqual([]);
    expect(model.issues).toEqual([
      'Playground control "tone" has no options, so the playground is omitted.',
    ]);
  });
});

describe("helper components", () => {
  const { Page, Section, Example } = docsFor(btn);

  it("an Example returned by a helper inside a Section is an example", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Section title="S">
          <SolidExample />
        </Section>
      </Page>,
    );

    expect(model.issues).toEqual([]);
    expect(sectionsOf(model)[0]?.content).toMatchObject([
      { kind: "example", title: "Solid" },
    ]);
  });

  it("a Section returned by a helper under the Page is a section", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <SolidSection />
      </Page>,
    );

    expect(model.issues).toEqual([]);
    expect(sectionsOf(model).map((s) => s.title)).toEqual(["Solid section"]);
  });

  it("reports an Example returned by a helper directly under the Page", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <SolidExample />
      </Page>,
    );

    expect(model.issues).toEqual(["<Example> must be inside a <Section>."]);
    expect(model.blocks).toEqual([]);
  });

  it("reports a marker a helper returns inside an example or prose", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Section title="S">
          <div>
            <SolidSection />
          </div>
          <Example>
            <SolidExample />
          </Example>
        </Section>
      </Page>,
    );

    expect(model.issues).toEqual([
      "<Section> must be a direct child of <Page>.",
      "<Example> cannot be inside another <Example>.",
    ]);
  });

  it("reports a helper that throws and omits the content it was in", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Broken />
        <Section title="S">
          <Broken />
          <div>
            <Broken />
          </div>
          <Example>
            <Broken />
          </Example>
          <p>Kept.</p>
        </Section>
      </Page>,
    );

    expect(model.issues).toEqual(
      Array(4).fill('<Broken> threw "boom"; the content using it is omitted.'),
    );
    expect(model.blocks.map((b) => b.kind)).toEqual(["section"]);
    expect(sectionsOf(model)[0]?.content).toMatchObject([{ kind: "prose" }]);
  });

  it("validates at-a-glance content and omits it when a helper throws", () => {
    const model = toDocModel(
      <Page title="Button" description="Buttons." atAGlance={<Broken />} />,
    );

    expect(model.issues).toEqual([
      '<Broken> threw "boom"; the content using it is omitted.',
    ]);
    expect(model.atAGlance).toBeUndefined();
  });

  function Broken(): ShowcaseJsxNode {
    throw new Error("boom");
  }

  function SolidExample() {
    return (
      <Example title="Solid">
        <button className="btn-solid" />
      </Example>
    );
  }

  function SolidSection() {
    return <Section title="Solid section" />;
  }
});

describe("controls a parent and a derived component both define", () => {
  const sized = component("sz")
    .vars({ "--size": "1rem" })
    .controlled("--size", { sm: "0.5rem", md: "1rem" })
    .body({ "font-size": dsl.cssvar("--size") })
    .derive("child", (child) =>
      child
        .vars({ "--size": "3rem" })
        .controlled("--size", { xs: "0.25rem", xl: "3rem" })
        .body({ "font-size": dsl.cssvar("--size") }),
    );

  it("take the derived component's presets in the types", () => {
    expectTypeOf<PlaygroundValues<typeof sized>>().toEqualTypeOf<{
      size: "xs" | "xl";
    }>();
  });

  it("produce one control with the derived component's presets", () => {
    const { Page, Playground } = docsFor(sized);
    const model = toDocModel(
      <Page title="Sized" description="d">
        <Playground render={() => <div />} />
      </Page>,
    );

    expect(playgroundOf(model).controls).toEqual([
      {
        name: "size",
        label: "Size",
        kind: "select",
        options: ["xs", "xl"],
        optionLabels: { xs: "xs", xl: "xl" },
        default: "xl",
      },
    ]);
  });
});

describe("custom select defaults", () => {
  it("fall back to the first option when not one of the options", () => {
    const { Page, Playground } = docs();
    const model = toDocModel(
      <Page title="Guide" description="d">
        <Playground
          controls={{
            tone: { kind: "select", options: ["primary"], default: "accent" },
          }}
          render={() => <div />}
        />
      </Page>,
    );

    expect(playgroundOf(model).controls).toEqual([
      {
        name: "tone",
        label: "Tone",
        kind: "select",
        options: ["primary"],
        optionLabels: { primary: "primary" },
        default: "primary",
      },
    ]);
    expect(model.issues).toEqual([
      'Playground control "tone" defaults to "accent", which is not one of its options; using "primary".',
    ]);
  });
});

describe("playground control labels", () => {
  it("control helpers accept a config object", () => {
    expect(
      control.select(["any", "closerequest", "none"], {
        default: "closerequest",
        label: "Dismissal (closedby)",
        optionLabels: {
          any: "Esc or backdrop click",
          closerequest: "Esc only",
        },
      }),
    ).toEqual({
      kind: "select",
      options: ["any", "closerequest", "none"],
      default: "closerequest",
      label: "Dismissal (closedby)",
      optionLabels: { any: "Esc or backdrop click", closerequest: "Esc only" },
    });
    expect(
      control.palette(["primary", "secondary"], {
        default: "secondary",
        label: "Tone",
        optionLabels: { primary: "Brand" },
      }),
    ).toEqual({
      kind: "select",
      options: ["primary", "secondary"],
      default: "secondary",
      label: "Tone",
      optionLabels: { primary: "Brand" },
    });
    expect(
      control.boolean({
        label: "Thumb",
        offLabel: "Default",
        onLabel: "Custom",
      }),
    ).toEqual({
      kind: "boolean",
      default: false,
      label: "Thumb",
      offLabel: "Default",
      onLabel: "Custom",
    });
    expect(control.text({ default: "Overview", label: "Label" })).toEqual({
      kind: "text",
      default: "Overview",
      label: "Label",
    });
  });

  it("the config form falls back to the same defaults as the positional form", () => {
    expect(control.select(["a", "b"], {})).toMatchObject({ default: "a" });
    expect(control.palette(["accent", "primary"], {})).toMatchObject({
      default: "primary",
    });
    expect(control.boolean({})).toMatchObject({ default: false });
    expect(control.text({})).toMatchObject({ default: "" });
  });

  it("resolve every option's label, every boolean's state labels, and the control labels", () => {
    const { Page, Playground } = docs();
    const model = toDocModel(
      <Page title="Guide" description="d">
        <Playground
          controls={{
            closedby: control.select(["any", "closerequest", "none"], {
              label: "Dismissal (closedby)",
              optionLabels: { closerequest: "Esc only" },
            }),
            thumb: control.boolean({
              default: true,
              label: "Thumb",
              offLabel: "Default",
              onLabel: "Custom",
            }),
            heading: control.text({ default: "Overview", label: "Heading" }),
          }}
          render={() => <div />}
        />
      </Page>,
    );

    expect(playgroundOf(model).controls).toEqual([
      {
        name: "closedby",
        label: "Dismissal (closedby)",
        kind: "select",
        options: ["any", "closerequest", "none"],
        optionLabels: { any: "any", closerequest: "Esc only", none: "none" },
        default: "any",
      },
      {
        name: "thumb",
        label: "Thumb",
        kind: "boolean",
        default: true,
        offLabel: "Default",
        onLabel: "Custom",
      },
      { name: "heading", label: "Heading", kind: "text", default: "Overview" },
    ]);
    expect(model.issues).toEqual([]);
  });

  it("apply a derived control override's optionLabels", () => {
    const { Page, Playground } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Playground
          controls={{
            variant: { label: "Style", optionLabels: { solid: "Solid fill" } },
            size: false,
          }}
          render={() => <button />}
        />
      </Page>,
    );

    expect(playgroundOf(model).controls).toEqual([
      {
        name: "variant",
        label: "Style",
        kind: "select",
        options: ["solid", "soft"],
        optionLabels: { solid: "Solid fill", soft: "soft" },
        default: "soft",
      },
    ]);
    expect(model.issues).toEqual([]);
  });

  it("show an option's value when its label is undefined", () => {
    const { Page, Playground } = docs();
    const model = toDocModel(
      <Page title="Guide" description="d">
        <Playground
          controls={{
            tone: control.select(["primary", "accent"], {
              optionLabels: { primary: undefined, accent: "Accent" },
            }),
          }}
          render={() => <div />}
        />
      </Page>,
    );

    expect(playgroundOf(model).controls).toEqual([
      expect.objectContaining({
        optionLabels: { primary: "primary", accent: "Accent" },
      }),
    ]);
    expect(model.issues).toEqual([]);
  });

  it("show an option's value when its name is an inherited object property", () => {
    const { Page, Playground } = docs();
    const model = toDocModel(
      <Page title="Guide" description="d">
        <Playground
          controls={{
            key: control.select(["constructor", "toString"]),
            proto: control.select(["__proto__"]),
          }}
          render={() => <div />}
        />
      </Page>,
    );

    const [key, proto] = playgroundOf(model).controls;
    expect(key).toMatchObject({
      optionLabels: { constructor: "constructor", toString: "toString" },
    });
    expect(proto?.kind === "select" && proto.optionLabels["__proto__"]).toBe(
      "__proto__",
    );
    expect(model.issues).toEqual([]);
  });

  it("report a label for an option that isn't one of the final options", () => {
    const { Page, Playground } = docsFor(btn);
    const model = toDocModel(
      <Page title="Button" description="Buttons.">
        <Playground
          controls={{
            variant: {
              options: ["solid"],
              // @ts-expect-error simulates a label for an option narrowed out
              optionLabels: { solid: "Solid fill", soft: "soft" },
            },
            size: false,
            tone: {
              kind: "select",
              options: ["primary"],
              default: "primary",
              optionLabels: { accent: "Accent" },
            },
          }}
          render={() => <button />}
        />
      </Page>,
    );

    expect(playgroundOf(model).controls).toEqual([
      expect.objectContaining({
        name: "variant",
        optionLabels: { solid: "Solid fill" },
      }),
      expect.objectContaining({
        name: "tone",
        optionLabels: { primary: "primary" },
      }),
    ]);
    expect(model.issues).toEqual([
      'Playground control "variant" has a label for "soft", which is not one of its options.',
      'Playground control "tone" has a label for "accent", which is not one of its options.',
    ]);
  });
});

describe("resolveDocLocation", () => {
  it("derives the path and group from a component's folder", () => {
    expect(
      resolveDocLocation("tailwind/components/button/button.docs.tsx", {
        title: "Button",
      }),
    ).toEqual({
      path: ["components", "button"],
      group: ["Components"],
      label: "Button",
    });
  });

  it("nests groups for nested folders and accepts files not in their own folder", () => {
    expect(
      resolveDocLocation("tailwind/components/forms/select.docs.tsx", {
        title: "Select",
      }),
    ).toEqual({
      path: ["components", "forms", "select"],
      group: ["Components", "Forms"],
      label: "Select",
    });
  });

  it("uses the path relative to src for files outside tailwind", () => {
    expect(
      resolveDocLocation("guides/getting-started/installation.docs.tsx", {
        title: "Installation",
      }),
    ).toEqual({
      path: ["guides", "getting-started", "installation"],
      group: ["Guides", "Getting started"],
      label: "Installation",
    });
  });

  it("applies nav overrides", () => {
    expect(
      resolveDocLocation("tailwind/themes/tokens.docs.tsx", {
        title: "Core Tokens",
        nav: { label: "Tokens", group: "Core", order: 1, path: "/core/tokens" },
      }),
    ).toEqual({
      path: ["core", "tokens"],
      group: ["Core"],
      label: "Tokens",
      order: 1,
    });
  });

  it("puts a page at the top level when nav.group is empty", () => {
    expect(
      resolveDocLocation("guides/introduction.docs.tsx", {
        title: "Introduction",
        nav: { group: "" },
      }).group,
    ).toEqual([]);
  });

  it("toDocModel passes the Page nav through", () => {
    const { Page } = docs();
    expect(
      toDocModel(
        <Page
          title="Tokens"
          description="d"
          nav={{ group: "Core", order: 2 }}
        />,
      ).nav,
    ).toEqual({ group: "Core", order: 2 });
  });

  it("nav only accepts known keys", () => {
    const { Page } = docs();
    // @ts-expect-error unknown nav key
    void (<Page title="T" description="d" nav={{ grup: "Core" }} />);
  });
});
