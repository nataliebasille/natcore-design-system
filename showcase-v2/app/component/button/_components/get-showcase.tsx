/** @jsxImportSource @/lib/preview-jsx-runtime */

import type { ButtonControlValues } from "./button-playground-controls";

export function getButtonPlaygroundShowcase(values: ButtonControlValues) {
  const className = [
    `btn-${values.variant}/${values.palette}`,
    `btn-size-${values.size}`,
  ].join(" ");

  return <button className={className}>Button</button>;
}
