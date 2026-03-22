/** @jsxImportSource @/lib/preview-jsx-runtime */

import type { ToggleControlValues } from "./toggle-playground-controls";

export function getTogglePlaygroundShowcase(values: ToggleControlValues) {
  const className = `toggle-${values.variant}/${values.palette}`;

  return (
    <label className={className}>
      <input type="checkbox" />
    </label>
  );
}
