"use client";

import { usePlayground } from "@/app/_ui/playground/playground-provider";
import type { controls } from "./button-playground-controls";

[
  "btn-solid/primary",
  "btn-solid/secondary",
  "btn-solid/accent",
  "btn-solid/surface",
  "btn-outline/primary",
  "btn-outline/secondary",
  "btn-outline/accent",
  "btn-outline/surface",
  "btn-ghost/primary",
  "btn-ghost/secondary",
  "btn-ghost/accent",
  "btn-ghost/surface",
];

export function ButtonPlaygroundResult() {
  const { values } = usePlayground<typeof controls>();

  return (
    <div className="flex">
      <button className={`btn-${values.variant}/${values.palette}`}>
        Button
      </button>
    </div>
  );
}
