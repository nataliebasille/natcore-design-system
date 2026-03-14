"use client";

import { usePlayground } from "@/app/_ui/playground/playground-provider";
import { renderToUi } from "@/lib/preview-jsx-runtime";
import type { controls } from "./button-playground-controls";
import { getButtonPlaygroundShowcase } from "./get-showcase";

export function ButtonPlaygroundShowcaseUI() {
  const { values } = usePlayground<typeof controls>();
  return <>{renderToUi(getButtonPlaygroundShowcase(values))}</>;
}
