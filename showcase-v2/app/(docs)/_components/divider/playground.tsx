import { defaultValues } from "./divider-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getDividerPlaygroundShowcase } from "./get-showcase";
import { codeToHtml } from "shiki/bundle/web";
import { DividerPlaygroundClient } from "./divider-playground-client";

export default async function DividerPlayground() {
  const initialHtml = await codeToHtml(
    renderToMarkup(getDividerPlaygroundShowcase(defaultValues)),
    {
      lang: "html",
      theme: "github-dark",
      structure: "inline",
    },
  );

  return <DividerPlaygroundClient initialHtml={initialHtml} />;
}
