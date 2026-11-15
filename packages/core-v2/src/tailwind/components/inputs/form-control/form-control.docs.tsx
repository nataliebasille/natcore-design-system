import { control, docsFor } from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import formControl from "./form-control.css.ts";

const { Page, Playground, Section, Example } = docsFor(formControl);

// Written out so Tailwind's source scan generates every playground class.
const FORM_CONTROL_CLASSES = {
  outline: {
    primary: "form-control-outline/primary",
    secondary: "form-control-outline/secondary",
    accent: "form-control-outline/accent",
    surface: "form-control-outline/surface",
    danger: "form-control-outline/danger",
  },
  soft: {
    primary: "form-control-soft/primary",
    secondary: "form-control-soft/secondary",
    accent: "form-control-soft/accent",
    surface: "form-control-soft/surface",
    danger: "form-control-soft/danger",
  },
  solid: {
    primary: "form-control-solid/primary",
    secondary: "form-control-solid/secondary",
    accent: "form-control-solid/accent",
    surface: "form-control-solid/surface",
    danger: "form-control-solid/danger",
  },
  underline: {
    primary: "form-control-underline/primary",
    secondary: "form-control-underline/secondary",
    accent: "form-control-underline/accent",
    surface: "form-control-underline/surface",
    danger: "form-control-underline/danger",
  },
} as const;

export default (
  <Page
    title="Form Control"
    description="Lays out a label, an optional prefix and suffix, a field, and a hint as one control. A plain label and input, select, or textarea are found automatically; data-slot attributes place everything else."
    atAGlance={
      <Grid>
        <div className="form-control">
          <label htmlFor="glance-name">Display name</label>
          <input id="glance-name" placeholder="Ada Lovelace" />
        </div>
        <div className="form-control-soft/primary">
          <label htmlFor="glance-price">Price</label>
          <span data-slot="prefix">$</span>
          <input id="glance-price" placeholder="0" />
          <span data-slot="suffix">USD</span>
        </div>
        <div className="form-control-underline/danger">
          <label htmlFor="glance-email">Email</label>
          <input id="glance-email" placeholder="ada@example.com" />
          <small data-slot="hint">Enter a valid email address.</small>
        </div>
      </Grid>
    }
  >
    <Playground
      controls={{
        variant: { default: "outline" },
        palette: control.palette([
          "primary",
          "secondary",
          "accent",
          "surface",
          "danger",
        ]),
        label: control.text("Amount"),
        prefix: control.boolean({ default: true, label: "Prefix" }),
        suffix: control.boolean({ default: true, label: "Suffix" }),
        hint: control.boolean({ default: true, label: "Hint" }),
      }}
      render={(v) => (
        <div
          className={[
            FORM_CONTROL_CLASSES[v.variant][v.palette],
            "w-full max-w-sm",
          ].join(" ")}
        >
          <label htmlFor="playground-input">{v.label}</label>
          {v.prefix && <span data-slot="prefix">$</span>}
          <input id="playground-input" placeholder="0" />
          {v.suffix && <span data-slot="suffix">.00</span>}
          {v.hint && (
            <small data-slot="hint">
              {v.palette === "danger" ?
                "Enter a whole dollar amount."
              : "Whole dollars only."}
            </small>
          )}
        </div>
      )}
    />

    <Section
      of="form-control"
      description="Joins a label and its field into one bordered box with the outline look. Works with input, select, and textarea, and with the palette modifier."
    >
      <Example
        title="Label and input"
        description="Put a label and a field inside form-control; no other markup is needed."
      >
        <div className="form-control max-w-sm">
          <label htmlFor="basic-name">Display name</label>
          <input id="basic-name" placeholder="Ada Lovelace" />
        </div>
      </Example>

      <Example
        title="Select and textarea"
        description="Selects and textareas take the field position the same way."
      >
        <Grid>
          <div className="form-control">
            <label htmlFor="basic-role">Role</label>
            <select id="basic-role">
              <option>Designer</option>
              <option>Engineer</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="basic-bio">Bio</label>
            <textarea id="basic-bio" rows={2} placeholder="A few words" />
          </div>
        </Grid>
      </Example>

      <Example
        title="Palettes"
        description="Add a palette modifier, such as form-control/primary, to color the border and its focus state."
      >
        <Grid>
          <div className="form-control/primary">
            <label htmlFor="palette-primary">Primary</label>
            <input id="palette-primary" placeholder="Focus me" />
          </div>
          <div className="form-control/accent">
            <label htmlFor="palette-accent">Accent</label>
            <input id="palette-accent" placeholder="Focus me" />
          </div>
        </Grid>
      </Example>
    </Section>

    <Section
      of="form-control@variant"
      title="Variants"
      description="Changes how the control is drawn. Every variant takes a palette modifier, for example form-control-soft/primary."
    >
      <Example
        title="Outline"
        description="A transparent box with a tone border. This is what form-control on its own renders."
      >
        <VariantRow
          classes={[
            "form-control-outline/primary",
            "form-control-outline/surface",
          ]}
          id="outline"
        />
      </Example>

      <Example title="Soft" description="A tinted fill with no visible border.">
        <VariantRow
          classes={["form-control-soft/primary", "form-control-soft/surface"]}
          id="soft"
        />
      </Example>

      <Example title="Solid" description="A strong fill with contrasting text.">
        <VariantRow
          classes={["form-control-solid/primary", "form-control-solid/surface"]}
          id="solid"
        />
      </Example>

      <Example
        title="Underline"
        description="Only a bottom rule under the field."
      >
        <VariantRow
          classes={[
            "form-control-underline/primary",
            "form-control-underline/surface",
          ]}
          id="underline"
        />
      </Example>
    </Section>

    <Section
      of="@slots"
      title="Slots"
      description='Direct children take their place in the control by element or by data-slot. A plain label and input, select, or textarea need no attribute; data-slot="label" and data-slot="input" place custom elements in those positions.'
    >
      <Example
        title="Prefix and suffix"
        description='data-slot="prefix" and data-slot="suffix" join the field into one box on either side.'
      >
        <div className="form-control max-w-sm">
          <label htmlFor="slots-site">Website</label>
          <span data-slot="prefix">https://</span>
          <input id="slots-site" placeholder="example" />
          <span data-slot="suffix">.com</span>
        </div>
      </Example>

      <Example
        title="Hint"
        description='data-slot="hint" sits just below the field.'
      >
        <div className="form-control max-w-sm">
          <label htmlFor="slots-username">Username</label>
          <input id="slots-username" placeholder="ada" />
          <small data-slot="hint">Letters, numbers, and dashes.</small>
        </div>
      </Example>

      <Example
        title="Custom elements"
        description='Use data-slot="label" and data-slot="input" when the label or field is not a native element, such as a custom picker.'
      >
        <div className="form-control max-w-sm">
          <span data-slot="label" id="slots-color-label">
            Accent color
          </span>
          <div
            data-slot="input"
            role="radiogroup"
            aria-labelledby="slots-color-label"
            className="flex gap-2"
          >
            <input
              type="radio"
              name="slots-accent"
              aria-label="Primary"
              className="bg-primary-500 size-5 appearance-none rounded-full border-0 p-0 outline-offset-2 checked:outline-2 checked:outline-current focus-visible:outline-2"
              checked
            />
            <input
              type="radio"
              name="slots-accent"
              aria-label="Secondary"
              className="bg-secondary-500 size-5 appearance-none rounded-full border-0 p-0 outline-offset-2 checked:outline-2 checked:outline-current focus-visible:outline-2"
            />
            <input
              type="radio"
              name="slots-accent"
              aria-label="Accent"
              className="bg-accent-500 size-5 appearance-none rounded-full border-0 p-0 outline-offset-2 checked:outline-2 checked:outline-current focus-visible:outline-2"
            />
          </div>
        </div>
      </Example>

      <Example
        title="Without a field"
        description="With no field inside, the control itself becomes the bordered box and the label is plain text."
      >
        <div className="form-control max-w-sm">
          <label>Status</label>
          <span>Verified on March 3</span>
        </div>
      </Example>
    </Section>

    <Section
      title="Invalid Fields"
      description="form-control has no built-in error look. You decide what an invalid field looks like and when it applies, using Tailwind variants on the control and on its hint. These examples use the danger palette, but any class works."
    >
      <p>
        Put a <code className="code-inline">has-*</code> variant on the control
        to change its look when a field inside it is invalid, for example{" "}
        <code className="code-inline">
          has-user-invalid:form-control/danger
        </code>
        . The hint is a sibling of the field, so it needs its own variant. Pick
        the one that matches where the invalid state lives:
      </p>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>On the field itself:</strong> add{" "}
          <code className="code-inline">peer</code> to the field, and{" "}
          <code className="code-inline">peer-user-invalid:</code> or{" "}
          <code className="code-inline">peer-aria-invalid:</code> to the hint.
        </li>
        <li>
          <strong>Nested inside a custom field:</strong> add{" "}
          <code className="code-inline">peer</code> to the custom field, and{" "}
          <code className="code-inline">peer-has-user-invalid:</code> or{" "}
          <code className="code-inline">peer-has-aria-invalid:</code> to the
          hint.
        </li>
        <li>
          <strong>Anywhere in the control:</strong> add{" "}
          <code className="code-inline">group</code> to the control, and{" "}
          <code className="code-inline">group-has-user-invalid:</code> or{" "}
          <code className="code-inline">group-has-aria-invalid:</code> to the
          hint. It uses the same check as the control&apos;s{" "}
          <code className="code-inline">has-*</code> class, so the two always
          agree.
        </li>
      </ul>
      <p>
        Use <code className="code-inline">user-invalid</code> when the browser
        validates the field (<code className="code-inline">required</code>,{" "}
        <code className="code-inline">type</code>,{" "}
        <code className="code-inline">pattern</code>): it applies once the user
        has typed and left the field. Use{" "}
        <code className="code-inline">aria-invalid</code> when your own code
        decides, and for custom fields, which the browser cannot validate.
      </p>

      <Example
        title="The browser validates the field"
        description="Type something that is not an email address, then click outside the field."
        table={[
          {
            label: "Control",
            content: (
              <span>
                <code className="code-inline">
                  has-user-invalid:form-control/danger
                </code>{" "}
                switches it to the danger palette once the user leaves the field
                with an invalid value.
              </span>
            ),
          },
          {
            label: "Input",
            content: (
              <span>
                <code className="code-inline">peer</code> lets the hint react to
                it.
              </span>
            ),
          },
          {
            label: "Hint",
            content: (
              <span>
                <code className="code-inline">
                  peer-user-invalid:text-danger-700
                </code>{" "}
                colors it at the same moment.
              </span>
            ),
          },
        ]}
      >
        <div className="form-control/primary has-user-invalid:form-control/danger max-w-sm">
          <label htmlFor="invalid-native">Email</label>
          <input
            id="invalid-native"
            className="peer"
            type="email"
            placeholder="ada@example.com"
          />
          <small data-slot="hint" className="peer-user-invalid:text-danger-700">
            Enter an email address.
          </small>
        </div>
      </Example>

      <Example
        title="Your code marks the field invalid"
        description="Your validation code sets the field's aria-invalid attribute. Screen readers announce it, and the styling follows."
        table={[
          {
            label: "Control",
            content: (
              <span>
                <code className="code-inline">
                  has-aria-invalid:form-control/danger
                </code>{" "}
                applies while any field inside has{" "}
                <code className="code-inline">aria-invalid="true"</code>.
              </span>
            ),
          },
          {
            label: "Input",
            content: (
              <span>
                <code className="code-inline">peer</code>, plus{" "}
                <code className="code-inline">aria-invalid="true"</code> set by
                your code.
              </span>
            ),
          },
          {
            label: "Hint",
            content: (
              <span>
                <code className="code-inline">
                  peer-aria-invalid:text-danger-700
                </code>
              </span>
            ),
          },
        ]}
      >
        <div className="form-control/primary has-aria-invalid:form-control/danger max-w-sm">
          <label htmlFor="invalid-aria">Username</label>
          <input
            id="invalid-aria"
            className="peer"
            aria-invalid="true"
            placeholder="ada"
          />
          <small data-slot="hint" className="peer-aria-invalid:text-danger-700">
            That username is taken.
          </small>
        </div>
      </Example>

      <Example
        title="The invalid state is nested inside a custom field"
        description="The custom field wraps the element that is invalid, so the hint has to look inside its peer."
        table={[
          {
            label: "Control",
            content: (
              <span>
                <code className="code-inline">
                  has-aria-invalid:form-control/danger
                </code>
              </span>
            ),
          },
          {
            label: "Custom field",
            content: (
              <span>
                <code className="code-inline">data-slot="input"</code> places it
                in the field position, and{" "}
                <code className="code-inline">peer</code> lets the hint react to
                it.
              </span>
            ),
          },
          {
            label: "Element inside",
            content: (
              <span>
                <code className="code-inline">aria-invalid="true"</code>. It
                needs an input role, here{" "}
                <code className="code-inline">combobox</code>: screen readers
                only read <code className="code-inline">aria-invalid</code> on
                native fields and input roles.
              </span>
            ),
          },
          {
            label: "Hint",
            content: (
              <span>
                <code className="code-inline">
                  peer-has-aria-invalid:text-danger-700
                </code>
              </span>
            ),
          },
        ]}
      >
        <div className="form-control/primary has-aria-invalid:form-control/danger max-w-sm">
          <label htmlFor="invalid-tags">Tags</label>
          <div data-slot="input" className="peer flex items-center gap-2">
            <span className="rounded-sm px-1.5 text-sm outline outline-current/30">
              Design
            </span>
            <input
              id="invalid-tags"
              role="combobox"
              aria-expanded="false"
              aria-invalid="true"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 outline-none"
              placeholder="Add a tag"
            />
          </div>
          <small
            data-slot="hint"
            className="peer-has-aria-invalid:text-danger-700"
          >
            Tags can only use lowercase letters.
          </small>
        </div>
      </Example>

      <Example
        title="Anywhere in the control, with your own look"
        description="This control reacts to an invalid value from the browser or from your code, wherever the field is. It keeps the soft variant and only swaps the palette. Type 0, then click outside the field."
        table={[
          {
            label: "Control",
            content: (
              <span>
                <code className="code-inline">group</code>, plus{" "}
                <code className="code-inline">
                  has-user-invalid:form-control-soft/danger
                </code>{" "}
                and{" "}
                <code className="code-inline">
                  has-aria-invalid:form-control-soft/danger
                </code>{" "}
                so either kind of invalid switches it.
              </span>
            ),
          },
          {
            label: "Hint",
            content: (
              <span>
                <code className="code-inline">
                  group-has-user-invalid:text-danger-700
                </code>{" "}
                and{" "}
                <code className="code-inline">
                  group-has-aria-invalid:text-danger-700
                </code>
              </span>
            ),
          },
        ]}
      >
        <div className="group form-control-soft/primary has-user-invalid:form-control-soft/danger has-aria-invalid:form-control-soft/danger max-w-sm">
          <label htmlFor="invalid-price">Price</label>
          <span data-slot="prefix">$</span>
          <input id="invalid-price" type="number" min="1" placeholder="0" />
          <span data-slot="suffix">USD</span>
          <small
            data-slot="hint"
            className="group-has-user-invalid:text-danger-700 group-has-aria-invalid:text-danger-700"
          >
            Enter at least $1.
          </small>
        </div>
      </Example>

      <Example
        title="Your code already knows"
        description="When the page is rendered already knowing the value is wrong, write the look you want directly. Any variant and palette works."
      >
        <Grid>
          <div className="form-control/danger">
            <label htmlFor="invalid-direct">Username</label>
            <input id="invalid-direct" aria-invalid="true" placeholder="ada" />
            <small data-slot="hint">That username is taken.</small>
          </div>
          <div className="form-control-underline/danger">
            <label htmlFor="invalid-direct-underline">Username</label>
            <input
              id="invalid-direct-underline"
              aria-invalid="true"
              placeholder="ada"
            />
            <small data-slot="hint">That username is taken.</small>
          </div>
        </Grid>
      </Example>
    </Section>
  </Page>
);

function Grid({
  children,
}: {
  children?: ShowcaseJsxNode | ShowcaseJsxNode[];
}) {
  return (
    <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] items-start gap-4">
      {children}
    </ui-div>
  );
}

function VariantRow({ classes, id }: { classes: string[]; id: string }) {
  return (
    <Grid>
      {classes.map((className, i) => (
        <div className={className}>
          <label htmlFor={`${id}-${i}`}>{paletteLabel(className)}</label>
          <input id={`${id}-${i}`} placeholder="Focus me" />
          <small data-slot="hint">Hint text</small>
        </div>
      ))}
    </Grid>
  );
}

function paletteLabel(className: string) {
  const palette = className.split("/")[1] ?? "";
  return palette.charAt(0).toUpperCase() + palette.slice(1);
}
