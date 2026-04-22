import { defaultValues } from "./badge-playground-controls";
import { renderToMarkup } from "@nataliebasille/preview-jsx-runtime";
import { getBadgePlaygroundShowcase } from "./get-showcase";
import { codeToHtml } from "shiki/bundle/web";
import { BadgePlaygroundClient } from "./badge-playground-client";

export default async function BadgePlayground() {
  const initialHtml = await codeToHtml(
    renderToMarkup(getBadgePlaygroundShowcase(defaultValues)),
    {
      lang: "html",
      theme: "github-dark",
      structure: "inline",
    },
  );

  return <BadgePlaygroundClient initialHtml={initialHtml} />;
}
