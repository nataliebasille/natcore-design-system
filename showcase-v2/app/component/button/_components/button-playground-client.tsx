"use client";

import { Playground } from "@/app/_ui/playground/playground";
import {
  ButtonPlaygroundControls,
  controls,
  defaultValues,
} from "./button-playground-controls";
import { renderToMarkup } from "@/lib/preview-jsx-runtime";
import { getButtonPlaygroundShowcase } from "./get-showcase";
import { ButtonPlaygroundShowcaseUI } from "./button-playground-showcase-ui";

export function ButtonPlaygroundClient({
  initialHtml,
}: {
  initialHtml: string;
}) {
  return (
    <Playground<typeof controls>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<ButtonPlaygroundControls />}
      ui={<ButtonPlaygroundShowcaseUI />}
      renderMarkup={(values) =>
        renderToMarkup(getButtonPlaygroundShowcase(values))
      }
    />
  );
}
