"use client";

import { Playground } from "@/app/_ui/playground/playground";
import {
  CardPlaygroundControls,
  defaultValues,
  type CardControlValues,
} from "./card-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getCardPlaygroundShowcase } from "./get-showcase";
import { CardPlaygroundShowcaseUI } from "./card-playground-showcase-ui";

export function CardPlaygroundClient({ initialHtml }: { initialHtml: string }) {
  return (
    <Playground<CardControlValues>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={<CardPlaygroundControls />}
      ui={<CardPlaygroundShowcaseUI />}
      renderMarkup={(values) =>
        renderToMarkup(getCardPlaygroundShowcase(values))
      }
    />
  );
}
