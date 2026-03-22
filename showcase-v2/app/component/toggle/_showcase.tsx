/** @jsxImportSource @/lib/preview-jsx-runtime */

import { uiAttr, type JSX } from "@/lib/preview-jsx-runtime/jsx-runtime";

// Solid Palette
export const SolidPaletteShowcase = () => (
  <ui-div className="flex flex-wrap items-center gap-3">
    <label className="toggle-solid/primary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-solid/secondary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-solid/accent">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-solid/surface">
      <input type="checkbox" checked />
    </label>
  </ui-div>
);

// Soft Palette
export const SoftPaletteShowcase = () => (
  <ui-div className="flex flex-wrap items-center gap-3">
    <label className="toggle-soft/primary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-soft/secondary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-soft/accent">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-soft/surface">
      <input type="checkbox" checked />
    </label>
  </ui-div>
);

// Outline Palette
export const OutlinePaletteShowcase = () => (
  <ui-div className="flex flex-wrap items-center gap-3">
    <label className="toggle-outline/primary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-outline/secondary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-outline/accent">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-outline/surface">
      <input type="checkbox" checked />
    </label>
  </ui-div>
);

// Ghost Palette
export const GhostPaletteShowcase = () => (
  <ui-div className="flex flex-wrap items-center gap-3">
    <label className="toggle-ghost/primary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-ghost/secondary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-ghost/accent">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-ghost/surface">
      <input type="checkbox" checked />
    </label>
  </ui-div>
);

// Button Toggle — three ways to create a toggle without a checkbox
export const CheckboxToggleShowcase = () => (
  <label className="toggle-solid/primary">
    <input type="checkbox" checked />
  </label>
);

export const AriaCheckedToggleShowcase = () => (
  <button
    type="button"
    className="toggle-solid/primary"
    role="switch"
    aria-checked="true"
  />
);

export const ActiveClassToggleShowcase = () => (
  <div className="toggle-active toggle-solid/primary" />
);

// Thumb Slot — custom element inside the toggle track
export const ThumbSlotShowcase = () => (
  <ui-div className="flex flex-wrap items-center gap-6">
    <ui-div className="flex flex-col items-center gap-1">
      <markup>{"<!-- off state -->"}</markup>
      <label className="toggle-solid/primary">
        <input type="checkbox" />
        <span className="toggle-thumb flex items-center justify-center">
          <markup>{"<!-- icon -->"}</markup>
          <ui>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[60%]"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ui>
        </span>
      </label>
    </ui-div>

    <ui-div className="flex flex-col items-center gap-1">
      <markup>{"<!-- on state -->"}</markup>
      <label className="toggle-solid/primary">
        <input type="checkbox" checked />
        <span className="toggle-thumb flex items-center justify-center">
          <markup>{"<!-- icon -->"}</markup>
          <ui>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[60%]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </ui>
        </span>
      </label>
    </ui-div>
  </ui-div>
);

// CSS Variables — custom sizing via --toggle-h and --toggle-p
export const CssVarHeightShowcase = () => (
  <ui-div className="flex flex-wrap items-end gap-6">
    <label className="toggle-solid/primary [--toggle-h:1.25rem]">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-solid/primary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-solid/primary [--toggle-h:2.5rem]">
      <input type="checkbox" checked />
    </label>
  </ui-div>
);

export const CssVarPaddingShowcase = () => (
  <ui-div className="flex flex-wrap items-center gap-6">
    <label className="toggle-solid/primary [--toggle-p:0]">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-solid/primary">
      <input type="checkbox" checked />
    </label>
    <label className="toggle-solid/primary [--toggle-p:0.35rem]">
      <input type="checkbox" checked />
    </label>
  </ui-div>
);

// Custom Variants — toggle-on / toggle-off
export const CustomVariantsShowcase = () => (
  <ui-div className="flex flex-wrap items-center gap-6">
    <ui-div className="flex flex-col items-center gap-1">
      <markup>{"<!-- off: surface palette -->"}</markup>
      <label className="toggle-outline/primary toggle-off:palette-surface">
        <input type="checkbox" />
      </label>
    </ui-div>

    <ui-div className="flex flex-col items-center gap-1">
      <markup>{"<!-- on: primary palette -->"}</markup>
      <label className="toggle-outline/primary toggle-off:palette-surface">
        <input type="checkbox" checked />
      </label>
    </ui-div>
  </ui-div>
);
