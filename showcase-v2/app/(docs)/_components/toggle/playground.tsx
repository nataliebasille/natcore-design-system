import { defaultValues } from "./toggle-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getTogglePlaygroundShowcase } from "./get-showcase";
import { TogglePlaygroundClient } from "./toggle-playground-client";
import { highlightPlaygroundMarkup } from "@/app/_ui/playground/highlight-playground-markup";

export default async function TogglePlayground() {
  const initialHtml = await highlightPlaygroundMarkup(
    renderToMarkup(getTogglePlaygroundShowcase(defaultValues)),
  );

  return <TogglePlaygroundClient initialHtml={initialHtml} />;
}
