/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import { scopeAttr } from "@nataliebasille/preview-jsx-runtime/jsx-runtime";

export default {
  title: "Toggle",
  description:
    "A CSS-only toggle switch built on a native checkbox, aria-checked state, or a JavaScript-driven active class. Pick a variant and a palette; the track, thumb, and transition states are already wired in.",
  atAGlance: (
    <ui-div className="flex flex-wrap items-center gap-4 rounded-2xl">
      <StaticToggle className="toggle-solid/primary" checked={true} />
      <StaticToggle className="toggle-soft/secondary" checked={false} />
      <StaticToggle className="toggle-outline/accent" checked={true} />
      <StaticToggle className="toggle-ghost/surface" checked={false} />
    </ui-div>
  ),
  components: {
    toggle: {
      name: "Toggle",
      description:
        "Applies toggle styling using the selected variant and tone palette. Checked toggles render with the chosen palette, while unchecked toggles automatically fall back to palette-disabled.",
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
        {
          title: "--toggle-h",
          description:
            "Override the track height inline to make the control smaller or larger without introducing another variant.",
          content: cssVarHeightShowcase(),
        },
        {
          title: "--toggle-p",
          description:
            "Adjust the inner padding between the track edge and the thumb. Larger values create more inset spacing.",
          content: cssVarPaddingShowcase(),
        },
      ],
    },
  },
  sections: [
    {
      title: "Toggle Triggers",
      description:
        "Choose how the toggle state is driven: native form input, ARIA state, or a JavaScript-managed class.",
      showcases: [
        {
          title: "Label + Checkbox",
          description:
            "The native checkbox pattern needs no extra JavaScript. The checked input drives the on state automatically.",
          content: checkboxTriggerShowcase(),
        },
        {
          title: "Button + aria-checked",
          description:
            "Use aria-checked on a custom control when you need button semantics or your own interaction layer.",
          content: ariaCheckedShowcase(),
        },
        {
          title: ".toggle-active class",
          description:
            "For JavaScript-managed state, add .toggle-active to the toggle root to force the on state.",
          content: activeClassShowcase(),
        },
      ],
    },
  ],
  slots: {
    title: "Thumb Slot",
    description:
      'Add a child with [data-slot="thumb"] to replace the default thumb rendering while keeping the same toggle behavior.',
    showcases: [
      {
        title: "Custom Thumb",
        description:
          "Supply your own thumb content to add glyphs or state cues without rewriting the toggle track.",
        content: thumbSlotShowcase(),
      },
    ],
  },
  customVariants: {
    title: "Custom Variants",
    description:
      "The toggle exposes state variants for styling checked and unchecked states directly in utility classes.",
    showcases: [
      {
        title: "toggle-on: and toggle-off:",
        description:
          "Use the generated state variants to target thumb and track styling based on whether the toggle is on or off.",
        content: customVariantsShowcase(),
      },
    ],
  },
  cssvars: {
    "--h": "Height of the toggle track.",
    "--p": "Inner padding between the track edge and the thumb.",
  },
} satisfies Documentation<
  typeof import("../../../../../packages/core-v2/src/tailwind/components/toggle.css.ts").default
>;

function variantShowcase(variant: "solid" | "soft" | "outline" | "ghost") {
  const classes = {
    solid: {
      primary: "toggle-solid/primary",
      secondary: "toggle-solid/secondary",
      accent: "toggle-solid/accent",
      surface: "toggle-solid/surface",
    },

    soft: {
      primary: "toggle-soft/primary",
      secondary: "toggle-soft/secondary",
      accent: "toggle-soft/accent",
      surface: "toggle-soft/surface",
    },

    outline: {
      primary: "toggle-outline/primary",
      secondary: "toggle-outline/secondary",
      accent: "toggle-outline/accent",
      surface: "toggle-outline/surface",
    },

    ghost: {
      primary: "toggle-ghost/primary",
      secondary: "toggle-ghost/secondary",
      accent: "toggle-ghost/accent",
      surface: "toggle-ghost/surface",
    },
  };
  return (
    <ui-div className="md:grid-cols-2 grid w-full gap-3">
      <ToggleRow label="Primary" className={classes[variant].primary} />
      <ToggleRow label="Secondary" className={classes[variant].secondary} />
      <ToggleRow label="Accent" className={classes[variant].accent} />
      <ToggleRow label="Surface" className={classes[variant].surface} />
    </ui-div>
  );
}

function checkboxTriggerShowcase() {
  return (
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
        checked={true}
        interactive={false}
      />
    </ui-div>
  );
}

function ariaCheckedShowcase() {
  return (
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
  );
}

function activeClassShowcase() {
  return (
    <ui-div className="flex w-full flex-col gap-3">
      <ButtonToggleRow
        label="Without .toggle-active"
        className="toggle-ghost/surface"
      />
      <ButtonToggleRow
        label="With .toggle-active"
        className="toggle-active toggle-ghost/surface"
      />
    </ui-div>
  );
}

function thumbSlotShowcase() {
  return (
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
        checked={true}
        thumb={thumbGlyph("D")}
        interactive={false}
      />
    </ui-div>
  );
}

function cssVarHeightShowcase() {
  return (
    <ui-div className="md:grid-cols-3 grid w-full gap-3">
      <ToggleRow
        label="1.25rem"
        className="toggle-solid/primary [--toggle-h:1.25rem]"
        checked={true}
      />
      <ToggleRow
        label="Default"
        className="toggle-solid/primary"
        checked={true}
      />
      <ToggleRow
        label="2.5rem"
        className="toggle-solid/primary [--toggle-h:2.5rem]"
        checked={true}
      />
    </ui-div>
  );
}

function cssVarPaddingShowcase() {
  return (
    <ui-div className="md:grid-cols-3 grid w-full gap-3">
      <ToggleRow
        label="0"
        className="toggle-soft/secondary [--toggle-p:0]"
        checked={true}
      />
      <ToggleRow
        label="Default"
        className="toggle-soft/secondary"
        checked={true}
      />
      <ToggleRow
        label="0.35rem"
        className="toggle-soft/secondary [--toggle-p:0.35rem]"
        checked={true}
      />
    </ui-div>
  );
}

function customVariantsShowcase() {
  return (
    <ui-div className="flex w-full flex-col gap-3">
      <ToggleRow
        label="toggle-off:palette-surface"
        className="toggle-outline/surface toggle-on:text-white toggle-off:palette-surface"
        checked={false}
        thumb={thumbGlyph("L")}
        labelClassName="font-mono text-xs tracking-normal text-tone-500-accent"
        interactive={false}
      />
      <ToggleRow
        label="toggle-on:text-white"
        className="toggle-outline/surface toggle-on:text-white toggle-off:palette-surface"
        checked={true}
        thumb={thumbGlyph("D")}
        labelClassName="font-mono text-xs tracking-normal text-tone-500-accent"
        interactive={false}
      />
    </ui-div>
  );
}

function ToggleRow({
  label,
  className,
  checked = true,
  thumb,
  labelClassName,
  interactive = true,
}: {
  label: string;
  className: string;
  checked?: boolean;
  thumb?: ShowcaseJsxNode;
  labelClassName?: string;
  interactive?: boolean;
}) {
  return (
    <ui-div className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-tone-500-surface/10 bg-tone-100-surface/22 px-4 py-3">
      <span
        className={
          labelClassName ??
          "text-sm font-medium tracking-[0.01em] text-on-tone-50-surface/78"
        }
      >
        {label}
      </span>
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
    <ui-div className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-tone-500-surface/10 bg-tone-100-surface/22 px-4 py-3">
      <span className="font-mono text-xs tracking-normal text-tone-500-accent">
        {label}
      </span>
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
