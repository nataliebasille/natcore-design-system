/** @jsxImportSource @/lib/preview-jsx-runtime */

import type { controls } from "./button-playground-controls";
import type { PlaygroundValues } from "@/app/_ui/playground/playground";

export function getButtonPlaygroundShowcase(
  values: PlaygroundValues<typeof controls>,
) {
  const className = [
    `btn-${values.variant}/${values.palette}`,
    `btn-size-${values.size}`,
  ].join(" ");

  return <button className={className}>Button</button>;
}
