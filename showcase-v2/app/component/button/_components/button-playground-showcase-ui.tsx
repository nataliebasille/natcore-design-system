"use client";

import { usePlayground } from "@/app/_ui/playground/playground-provider";
import { renderToUi } from "@/lib/preview-jsx-runtime";
import { getButtonPlaygroundShowcase } from "./get-showcase";
import type { ButtonControlValues } from "./button-playground-controls";

export function ButtonPlaygroundShowcaseUI() {
  const { values } = usePlayground<ButtonControlValues>();
  return <>{renderToUi(getButtonPlaygroundShowcase(values))}</>;
}
