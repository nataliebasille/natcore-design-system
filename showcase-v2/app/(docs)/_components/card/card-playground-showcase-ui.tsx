"use client";

import { usePlayground } from "@/app/_ui/playground/playground-provider";
import { renderToUi } from "@nataliebasille/preview-jsx-runtime";
import { getCardPlaygroundShowcase } from "./get-showcase";
import type { CardControlValues } from "./card-playground-controls";

export function CardPlaygroundShowcaseUI() {
  const { values } = usePlayground<CardControlValues>();
  return <>{renderToUi(getCardPlaygroundShowcase(values))}</>;
}
