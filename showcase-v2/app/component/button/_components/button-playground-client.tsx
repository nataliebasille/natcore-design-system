"use client";

import { Playground } from "@/app/_ui/playground/playground";
import {
  ButtonPlaygroundControls,
  defaultValues,
  type ButtonControlValues,
} from "./button-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getButtonPlaygroundShowcase } from "./get-showcase";
import { ButtonPlaygroundShowcaseUI } from "./button-playground-showcase-ui";

export function ButtonPlaygroundClient({
  initialHtml,
}: {
  initialHtml: string;
}) {
  return (
    <Playground<ButtonControlValues>
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
