import { defaultValues } from "./card-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getCardPlaygroundShowcase } from "./get-showcase";
import { codeToHtml } from "shiki/bundle/web";
import { CardPlaygroundClient } from "./card-playground-client";

export default async function CardPlayground() {
  const initialHtml = await codeToHtml(
    renderToMarkup(getCardPlaygroundShowcase(defaultValues)),
    {
      lang: "html",
      theme: "github-dark",
      structure: "inline",
    },
  );

  return <CardPlaygroundClient initialHtml={initialHtml} />;
}
