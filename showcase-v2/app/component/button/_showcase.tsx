/** @jsxImportSource @/lib/preview-jsx-runtime */

import type { ShowcaseJsxNode } from "@/lib/preview-jsx-runtime";
import { uiAttr, type JSX } from "@/lib/preview-jsx-runtime/jsx-runtime";

// Icon Component
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

// Variants
export const VariantsShowcase = () => (
  <>
    <button className="btn-solid/primary">Solid</button>
    <button className="btn-outline/primary">Outline</button>
    <button className="btn-ghost/primary">Ghost</button>
  </>
);

// Sizes
export const SizesShowcase = () => (
  <ui-div className="w-full flex gap-3 items-center">
    <button className="btn-solid/primary btn-size-sm">Small</button>
    <button className="btn-solid/primary btn-size-md">Medium</button>
    <button className="btn-solid/primary btn-size-lg">Large</button>
  </ui-div>
);

// Solid Palette
export const SolidPaletteShowcase = () => (
  <ui-div className="w-full flex gap-3">
    <button className="btn-solid/primary">Primary</button>
    <button className="btn-solid/secondary">Secondary</button>
    <button className="btn-solid/accent">Accent</button>
    <button className="btn-solid/surface">Surface</button>
  </ui-div>
);

// Soft Palette
export const SoftPaletteShowcase = () => (
  <ui-div className="w-full flex gap-3">
    <button className="btn-soft/primary">Primary</button>
    <button className="btn-soft/secondary">Secondary</button>
    <button className="btn-soft/accent">Accent</button>
    <button className="btn-soft/surface">Surface</button>
  </ui-div>
);

// Outline Palette
export const OutlinePaletteShowcase = () => (
  <ui-div className="w-full flex gap-3">
    <button className="btn-outline/primary">Primary</button>
    <button className="btn-outline/secondary">Secondary</button>
    <button className="btn-outline/accent">Accent</button>
    <button className="btn-outline/surface">Surface</button>
  </ui-div>
);

// Ghost Palette
export const GhostPaletteShowcase = () => (
  <ui-div className="w-full flex gap-3">
    <button className="btn-ghost/primary">Primary</button>
    <button className="btn-ghost/secondary">Secondary</button>
    <button className="btn-ghost/accent">Accent</button>
    <button className="btn-ghost/surface">Surface</button>
  </ui-div>
);

// Icon Buttons
export const IconButtonsShowcase = () => (
  <ui-div className="w-full flex gap-3">
    <button
      className="btn-solid/primary btn-icon"
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
      className="btn-soft/primary btn-icon"
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
      className="btn-outline/primary btn-icon"
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
      className="btn-ghost/primary btn-icon"
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
);

const buttonGroupContents = (type: string) => (
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

export const buttonGroup = {
  solid: (
    <div className="btn-group-solid/primary">
      {buttonGroupContents("solid")}
    </div>
  ),
  soft: (
    <div className="btn-group-soft/primary">{buttonGroupContents("soft")}</div>
  ),
  outline: (
    <div className="btn-group-outline/primary">
      {buttonGroupContents("outline")}
    </div>
  ),
  ghost: (
    <div className="btn-group-ghost/primary">
      {buttonGroupContents("ghost")}
    </div>
  ),
};

// Button Groups
export const ButtonGroupsShowcase = () => (
  <ui-div className="w-full flex gap-3">
    <div className="btn-group/primary">
      <label>
        <input type="radio" name="btn-group" />
        First
      </label>
      <label>
        <input type="radio" name="btn-group" />
        Second
      </label>
      <label>
        <input type="radio" name="btn-group" />
        Third
      </label>
    </div>
  </ui-div>
);
