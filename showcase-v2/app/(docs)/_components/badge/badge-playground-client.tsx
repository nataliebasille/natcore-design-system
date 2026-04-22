"use client";

import { Playground } from "@/app/_ui/playground/playground";
import {
  BadgePlaygroundControls,
  defaultValues,
  type BadgeControlValues,
} from "./badge-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getBadgePlaygroundShowcase } from "./get-showcase";
import { BadgePlaygroundShowcaseUI } from "./badge-playground-showcase-ui";

export function BadgePlaygroundClient({
  initialHtml,
}: {
  initialHtml: string;
}) {
  return (
    <Playground<BadgeControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<BadgePlaygroundControls />}
      ui={<BadgePlaygroundShowcaseUI />}
      renderMarkup={(values) =>
        renderToMarkup(getBadgePlaygroundShowcase(values))
      }
    />
  );
}
