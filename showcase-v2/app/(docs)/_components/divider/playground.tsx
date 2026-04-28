import { defaultValues } from "./divider-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getDividerPlaygroundShowcase } from "./get-showcase";
import { DividerPlaygroundClient } from "./divider-playground-client";
import { highlightPlaygroundMarkup } from "@/app/_ui/playground/highlight-playground-markup";

export default async function DividerPlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getDividerPlaygroundShowcase(defaultValues)),
  );

  return <DividerPlaygroundClient initialHtml={initialHtml} />;
}
