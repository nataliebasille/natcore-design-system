/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { ToggleControlValues } from "./toggle-playground-controls";

export function getTogglePlaygroundShowcase(values: ToggleControlValues) {
  const className = `toggle-${values.variant}/${values.palette}${values.trigger === "active-class" && values.checked ? " toggle-active" : ""}`;
  const thumb =
    values.thumb ?
      <span data-slot="thumb">{values.checked ? thumbGlyph("D") : thumbGlyph("L")}</span>
    : null;

  if (values.trigger === "checkbox") {
    return (
      <label className={className}>
        <input type="checkbox" checked={values.checked} readOnly />
        {thumb}
      </label>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-label="Toggle"
      aria-checked={values.trigger === "aria" ? (values.checked ? "true" : "false") : undefined}
      className={className}
    >
      {thumb}
    </button>
  );
}

function thumbGlyph(value: string) {
  return (
    <span className="flex h-full items-center justify-center rounded-full text-[0.625rem] font-semibold">
      {value}
    </span>
  );
}