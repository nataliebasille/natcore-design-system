import { defaultValues } from "./toggle-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getTogglePlaygroundShowcase } from "./get-showcase";
import { codeToHtml } from "shiki/bundle/web";
import { TogglePlaygroundClient } from "./toggle-playground-client";

export default async function TogglePlayground() {
  const initialHtml = await codeToHtml(
    renderToMarkup(getTogglePlaygroundShowcase(defaultValues)),
    {
      lang: "html",
      theme: "github-dark",
      structure: "inline",
    },
  );

  return <TogglePlaygroundClient initialHtml={initialHtml} />;
}
