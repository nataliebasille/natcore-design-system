"use client";

import { Playground } from "@/app/_ui/playground/playground";
import {
  TogglePlaygroundControls,
  defaultValues,
  type ToggleControlValues,
} from "./toggle-playground-controls";
import { renderToMarkup } from "@/lib/preview-jsx-runtime";
import { getTogglePlaygroundShowcase } from "./get-showcase";
import { TogglePlaygroundShowcaseUI } from "./toggle-playground-showcase-ui";

export function TogglePlaygroundClient({
  initialHtml,
}: {
  initialHtml: string;
}) {
  return (
    <Playground<ToggleControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<TogglePlaygroundControls />}
      ui={<TogglePlaygroundShowcaseUI />}
      renderMarkup={(values) =>
        renderToMarkup(getTogglePlaygroundShowcase(values))
      }
    />
  );
}
