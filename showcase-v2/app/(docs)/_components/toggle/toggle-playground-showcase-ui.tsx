"use client";

import { usePlayground } from "@/app/_ui/playground/playground-provider";
import { renderToUi } from "@nataliebasille/preview-jsx-runtime";
import { getTogglePlaygroundShowcase } from "./get-showcase";
import type { ToggleControlValues } from "./toggle-playground-controls";

export function TogglePlaygroundShowcaseUI() {
  const { values } = usePlayground<ToggleControlValues>();
  return <>{renderToUi(getTogglePlaygroundShowcase(values))}</>;
}
