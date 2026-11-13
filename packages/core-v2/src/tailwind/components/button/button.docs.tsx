import { control, docsFor } from "@nataliebasille/css-engine";
import { uiAttr } from "@nataliebasille/preview-jsx-runtime/jsx-runtime";
import button from "./button.css.ts";

const { Page, Playground, Section, Example } = docsFor(button);

export default (
  <Page
    title="Button"
    description="Composable button utilities: pick a variant, a tone, and a size. Everything else (hover, focus, active) is built in."
    atAGlance={
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-solid/primary">Solid</button>
        <button className="btn-soft/secondary">Soft</button>
        <button className="btn-outline/accent">Outline</button>
        <button className="btn-ghost/surface">Ghost</button>
        <button className="btn-soft/surface btn-size-sm">Small</button>
        <button className="btn-soft/secondary btn-size-lg">Large</button>
      </div>
    }
  >
    <Playground
      controls={{
        palette: control.palette(["primary", "secondary", "accent", "surface"]),
      }}
      render={(v) => (
        <button className={`btn-${v.variant}/${v.palette} btn-size-${v.size}`}>
          Button
        </button>
      )}
    />

    <Section
      of="btn"
      description="Applies button styling using the selected variant and tone palette."
    >
      <Example title="Solid">
        <ui-div className="flex w-full flex-wrap gap-3">
          <button className="btn-solid/primary">Primary</button>
          <button className="btn-solid/secondary">Secondary</button>
          <button className="btn-solid/accent">Accent</button>
          <button className="btn-solid/surface">Surface</button>
        </ui-div>
      </Example>

      <Example title="Soft">
        <ui-div className="flex w-full flex-wrap gap-3">
          <button className="btn-soft/primary">Primary</button>
          <button className="btn-soft/secondary">Secondary</button>
          <button className="btn-soft/accent">Accent</button>
          <button className="btn-soft/surface">Surface</button>
        </ui-div>
      </Example>

      <Example title="Outline">
        <ui-div className="flex w-full flex-wrap gap-3">
          <button className="btn-outline/primary">Primary</button>
          <button className="btn-outline/secondary">Secondary</button>
          <button className="btn-outline/accent">Accent</button>
          <button className="btn-outline/surface">Surface</button>
        </ui-div>
      </Example>

      <Example title="Ghost">
        <ui-div className="flex w-full flex-wrap gap-3">
          <button className="btn-ghost/primary">Primary</button>
          <button className="btn-ghost/secondary">Secondary</button>
          <button className="btn-ghost/accent">Accent</button>
          <button className="btn-ghost/surface">Surface</button>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="group"
      title="Button Group"
      description="Groups adjacent buttons into a visually connected row sharing a variant style and tone palette."
    >
      <Example title="Solid">
        <div className="btn-group-solid/primary">
          {buttonGroupContents("solid")}
        </div>
      </Example>

      <Example title="Soft">
        <div className="btn-group-soft/primary">
          {buttonGroupContents("soft")}
        </div>
      </Example>

      <Example title="Outline">
        <div className="btn-group-outline/primary">
          {buttonGroupContents("outline")}
        </div>
      </Example>

      <Example title="Ghost">
        <div className="btn-group-ghost/primary">
          {buttonGroupContents("ghost")}
        </div>
      </Example>
    </Section>

    <Section
      of="size"
      title="Sizes"
      description="Controls the padding and font size of a button. Composes with any btn variant."
      vars={{
        "--px":
          "Inline (horizontal) padding. Override to decouple from --btn-size.",
        "--py":
          "Block (vertical) padding. Override to decouple from --btn-size.",
        "--gap": "Gap between content elements (e.g. icon + label).",
      }}
    >
      <Example
        title="Preset Sizes"
        description="Use sm, md, or lg to apply one of the three built-in size presets."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-3">
          <button className="btn-solid/primary btn-size-sm">Small</button>
          <button className="btn-solid/primary btn-size-md">Medium</button>
          <button className="btn-solid/primary btn-size-lg">Large</button>
        </ui-div>
      </Example>

      <Example
        title="Arbitrary Size"
        description="Pass any CSS length in square brackets to set a custom size."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-3">
          <button className="btn-solid/primary btn-size-[0.625rem]">
            0.625rem
          </button>
          <button className="btn-solid/primary btn-size-[1rem]">1rem</button>
          <button className="btn-solid/primary btn-size-[1.5rem]">
            1.5rem
          </button>
        </ui-div>
      </Example>

      <Example
        title="Override via CSS Variable"
        description="Set --btn-size directly as a CSS variable utility to control size dynamically."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-3">
          <button className="btn-solid/primary [--btn-size:0.75rem]">
            0.75rem
          </button>
          <button className="btn-solid/primary [--btn-size:1rem]">1rem</button>
          <button className="btn-solid/primary [--btn-size:1.25rem]">
            1.25rem
          </button>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="icon"
      title="Icon Buttons"
      description="Modifier utility to create square, fully-rounded icon buttons by equalizing inline and block padding. Composes with any btn variant and size."
    >
      <Example>
        <ui-div className="flex w-full flex-wrap gap-3">
          {(["solid", "soft", "outline", "ghost"] as const).map((variant) => (
            <button
              className={`btn-icon btn-${variant}/primary`}
              {...uiAttr({ "aria-label": `${variant} icon button` })}
            >
              <ui>
                <AlertCircleIcon />
              </ui>

              <markup>{"<!-- icon svg -->"}</markup>
            </button>
          ))}
        </ui-div>
      </Example>
    </Section>
  </Page>
);

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
