import { control, docsFor } from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import {
  scopeAttr,
  uiAttr,
} from "@nataliebasille/preview-jsx-runtime/jsx-runtime";
import toggle from "./toggle.css.ts";

const { Page, Playground, Section, Example } = docsFor(toggle);

export default (
  <Page
    title="Toggle"
    description="A CSS-only toggle switch driven by a native checkbox, aria-checked, or a JavaScript-managed active class. Pick a variant and a palette; the track, thumb, and transitions are built in."
    atAGlance={
      <div className="flex flex-wrap items-center gap-4">
        <StaticToggle className="toggle-solid/primary" checked />
        <StaticToggle className="toggle-soft/secondary" checked={false} />
        <StaticToggle className="toggle-outline/accent" checked />
        <StaticToggle className="toggle-ghost/surface" checked={false} />
      </div>
    }
  >
    <Playground
      controls={{
        palette: control.palette(["primary", "secondary", "accent", "surface"]),
        trigger: control.select(["checkbox", "aria", "active-class"], {
          optionLabels: {
            checkbox: "Checkbox",
            aria: "aria-checked",
            "active-class": ".toggle-active",
          },
        }),
        checked: control.boolean({ default: true, label: "State" }),
        thumb: control.boolean({
          label: "Thumb",
          offLabel: "Default",
          onLabel: "Custom",
        }),
      }}
      render={(v) => {
        const className = `toggle-${v.variant}/${v.palette}${v.trigger === "active-class" && v.checked ? " toggle-active" : ""}`;
        const thumb =
          v.thumb ?
            <span data-slot="thumb">{thumbGlyph(v.checked ? "D" : "L")}</span>
          : null;

        if (v.trigger === "checkbox") {
          return (
            <label className={className}>
              <input
                type="checkbox"
                checked={v.checked}
                readOnly
                {...uiAttr({ key: String(v.checked) })}
              />
              {thumb}
            </label>
          );
        }

        return (
          <button
            type="button"
            role="switch"
            aria-label="Toggle"
            aria-checked={
              v.trigger === "aria" ?
                v.checked ?
                  "true"
                : "false"
              : undefined
            }
            className={className}
          >
            {thumb}
          </button>
        );
      }}
    />

    <Section
      of="toggle"
      description="Applies toggle styling using the selected variant and tone palette. Checked toggles use the chosen palette; unchecked toggles fall back to palette-disabled."
      vars={{
        "--h": "Height of the toggle track. The default is 1.75rem.",
        "--p":
          "Inner padding between the track edge and the thumb. The default is an eighth of the height.",
      }}
    >
      <Example title="Solid">
        <ToggleGrid>
          <ToggleRow label="Primary" className="toggle-solid/primary" />
          <ToggleRow label="Secondary" className="toggle-solid/secondary" />
          <ToggleRow label="Accent" className="toggle-solid/accent" />
          <ToggleRow label="Surface" className="toggle-solid/surface" />
        </ToggleGrid>
      </Example>

      <Example title="Soft">
        <ToggleGrid>
          <ToggleRow label="Primary" className="toggle-soft/primary" />
          <ToggleRow label="Secondary" className="toggle-soft/secondary" />
          <ToggleRow label="Accent" className="toggle-soft/accent" />
          <ToggleRow label="Surface" className="toggle-soft/surface" />
        </ToggleGrid>
      </Example>

      <Example title="Outline">
        <ToggleGrid>
          <ToggleRow label="Primary" className="toggle-outline/primary" />
          <ToggleRow label="Secondary" className="toggle-outline/secondary" />
          <ToggleRow label="Accent" className="toggle-outline/accent" />
          <ToggleRow label="Surface" className="toggle-outline/surface" />
        </ToggleGrid>
      </Example>

      <Example title="Ghost">
        <ToggleGrid>
          <ToggleRow label="Primary" className="toggle-ghost/primary" />
          <ToggleRow label="Secondary" className="toggle-ghost/secondary" />
          <ToggleRow label="Accent" className="toggle-ghost/accent" />
          <ToggleRow label="Surface" className="toggle-ghost/surface" />
        </ToggleGrid>
      </Example>

      <Example
        title="Track height"
        description="Set --toggle-h to make the toggle smaller or larger without another variant."
      >
        <ToggleGrid>
          <ToggleRow
            label="1.25rem"
            className="toggle-solid/primary [--toggle-h:1.25rem]"
          />
          <ToggleRow label="Default" className="toggle-solid/primary" />
          <ToggleRow
            label="2.5rem"
            className="toggle-solid/primary [--toggle-h:2.5rem]"
          />
        </ToggleGrid>
      </Example>

      <Example
        title="Thumb inset"
        description="Set --toggle-p to change the space between the track edge and the thumb."
      >
        <ToggleGrid>
          <ToggleRow
            label="0"
            className="toggle-soft/secondary [--toggle-p:0]"
          />
          <ToggleRow label="Default" className="toggle-soft/secondary" />
          <ToggleRow
            label="0.35rem"
            className="toggle-soft/secondary [--toggle-p:0.35rem]"
          />
        </ToggleGrid>
      </Example>
    </Section>

    <Section
      title="Toggle Triggers"
      description="Choose what drives the toggle state: a native checkbox, ARIA state, or a JavaScript-managed class."
    >
      <Example
        title="Label + Checkbox"
        description="The native checkbox pattern needs no JavaScript. The checked input turns the toggle on."
      >
        <ui-div className="flex w-full flex-col gap-3">
          <ToggleRow
            label="Unchecked"
            className="toggle-soft/primary"
            checked={false}
            interactive={false}
          />
          <ToggleRow
            label="Checked"
            className="toggle-soft/primary"
            interactive={false}
          />
        </ui-div>
      </Example>

      <Example
        title="Button + aria-checked"
        description="Use aria-checked on a button with role switch when you need button semantics or your own interaction layer."
      >
        <ui-div className="flex w-full flex-col gap-3">
          <ButtonToggleRow
            label={'aria-checked="false"'}
            className="toggle-outline/accent"
          />
          <ButtonToggleRow
            label={'aria-checked="true"'}
            className="toggle-outline/accent"
            ariaChecked
          />
        </ui-div>
      </Example>

      <Example
        title=".toggle-active class"
        description="For JavaScript-managed state, add toggle-active to the toggle to turn it on."
      >
        <ui-div className="flex w-full flex-col gap-3">
          <ButtonToggleRow
            label="Without toggle-active"
            className="toggle-ghost/surface"
          />
          <ButtonToggleRow
            label="With toggle-active"
            className="toggle-active toggle-ghost/surface"
          />
        </ui-div>
      </Example>
    </Section>

    <Section
      of="@slots"
      title="Thumb Slot"
      description='Add a child with data-slot="thumb" to replace the default thumb while keeping the same toggle behavior.'
    >
      <Example
        title="Custom thumb"
        description="Supply your own thumb content to add glyphs or state cues."
      >
        <ui-div className="flex w-full flex-col gap-3">
          <ToggleRow
            label="Unchecked"
            className="toggle-outline/surface"
            checked={false}
            thumb={thumbGlyph("L")}
            interactive={false}
          />
          <ToggleRow
            label="Checked"
            className="toggle-outline/surface toggle-on:text-white toggle-off:palette-surface"
            thumb={thumbGlyph("D")}
            interactive={false}
          />
        </ui-div>
      </Example>
    </Section>

    <Section
      of="@custom-variants"
      title="Custom Variants"
      description="toggle-on: and toggle-off: style a toggle, or anything inside it, by whether it is on."
    >
      <Example title="toggle-on: and toggle-off:">
        <ui-div className="flex w-full flex-col gap-3">
          <ToggleRow
            label="toggle-off:palette-surface"
            className="toggle-outline/surface toggle-on:text-white toggle-off:palette-surface"
            checked={false}
            thumb={thumbGlyph("L")}
            mono
            interactive={false}
          />
          <ToggleRow
            label="toggle-on:text-white"
            className="toggle-outline/surface toggle-on:text-white toggle-off:palette-surface"
            thumb={thumbGlyph("D")}
            mono
            interactive={false}
          />
        </ui-div>
      </Example>
    </Section>
  </Page>
);

function ToggleGrid({
  children,
}: {
  children?: ShowcaseJsxNode | ShowcaseJsxNode[];
}) {
  return (
    <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3">
      {children}
    </ui-div>
  );
}

function ToggleRow({
  label,
  className,
  checked = true,
  thumb,
  mono = false,
  interactive = true,
}: {
  label: string;
  className: string;
  checked?: boolean;
  thumb?: ShowcaseJsxNode;
  mono?: boolean;
  interactive?: boolean;
}) {
  return (
    <ui-div className="border-surface-500/10 bg-surface-100/22 flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border px-4 py-3">
      <ui>
        <span
          className={
            mono ?
              "text-accent-500 font-mono text-xs tracking-normal"
            : "text-on-surface-50/78 text-sm font-medium"
          }
        >
          {label}
        </span>
      </ui>
      <StaticToggle
        className={className}
        checked={checked}
        thumb={thumb}
        interactive={interactive}
      />
    </ui-div>
  );
}

function ButtonToggleRow({
  label,
  className,
  ariaChecked = false,
}: {
  label: string;
  className: string;
  ariaChecked?: boolean;
}) {
  return (
    <ui-div className="border-surface-500/10 bg-surface-100/22 flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border px-4 py-3">
      <ui>
        <span className="text-accent-500 font-mono text-xs tracking-normal">
          {label}
        </span>
      </ui>
      <button
        type="button"
        role="switch"
        aria-checked={ariaChecked ? "true" : "false"}
        aria-label={label}
        {...scopeAttr(
          { class: `pointer-events-none ${className}` },
          { class: className },
        )}
      />
    </ui-div>
  );
}

function StaticToggle({
  className,
  checked,
  thumb,
  interactive = true,
}: {
  className: string;
  checked: boolean;
  thumb?: ShowcaseJsxNode;
  interactive?: boolean;
}) {
  return (
    <label
      {...scopeAttr(
        {
          class: `${interactive ? "" : "pointer-events-none "}shrink-0 ${className}`,
        },
        { class: className },
      )}
    >
      <input type="checkbox" checked={checked} readOnly />
      {thumb && <span data-slot="thumb">{thumb}</span>}
    </label>
  );
}

function thumbGlyph(value: string) {
  return (
    <span className="flex h-full items-center justify-center rounded-full text-[0.625rem] font-semibold">
      {value}
    </span>
  );
}
