"use client";

import { Playground } from "@/app/_ui/playground/playground";
import {
  DividerPlaygroundControls,
  defaultValues,
  type DividerControlValues,
} from "./divider-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getDividerPlaygroundShowcase } from "./get-showcase";
import { DividerPlaygroundShowcaseUI } from "./divider-playground-showcase-ui";

export function DividerPlaygroundClient({
  initialHtml,
}: {
  initialHtml: string;
}) {
  return (
    <Playground<DividerControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<DividerPlaygroundControls />}
      ui={<DividerPlaygroundShowcaseUI />}
      renderMarkup={(values) =>
        renderToMarkup(getDividerPlaygroundShowcase(values))
      }
    />
  );
}