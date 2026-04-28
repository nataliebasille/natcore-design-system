"use client";

import { usePlayground } from "@/app/_ui/playground/playground-provider";
import { renderToUi } from "@nataliebasille/preview-jsx-runtime";
import { getDividerPlaygroundShowcase } from "./get-showcase";
import type { DividerControlValues } from "./divider-playground-controls";

export function DividerPlaygroundShowcaseUI() {
  const { values } = usePlayground<DividerControlValues>();
  return <>{renderToUi(getDividerPlaygroundShowcase(values))}</>;
}