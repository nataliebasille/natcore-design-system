"use client";

import { usePlayground } from "@/app/_ui/playground/playground-provider";
import { renderToUi } from "@nataliebasille/preview-jsx-runtime";
import { getBadgePlaygroundShowcase } from "./get-showcase";
import type { BadgeControlValues } from "./badge-playground-controls";

export function BadgePlaygroundShowcaseUI() {
  const { values } = usePlayground<BadgeControlValues>();
  return <>{renderToUi(getBadgePlaygroundShowcase(values))}</>;
}
