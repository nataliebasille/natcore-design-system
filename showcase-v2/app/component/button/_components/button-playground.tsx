import { defaultValues } from "./button-playground-controls";
import { renderToMarkup } from "@/lib/preview-jsx-runtime";
import { getButtonPlaygroundShowcase } from "./get-showcase";
import { codeToHtml } from "shiki/bundle/web";
import { ButtonPlaygroundClient } from "./button-playground-client";

export async function ButtonPlayground() {
  const initialHtml = await codeToHtml(
    renderToMarkup(getButtonPlaygroundShowcase(defaultValues)),
    {
      lang: "html",
      theme: "github-dark",
      structure: "inline",
    },
  );

  return <ButtonPlaygroundClient initialHtml={initialHtml} />;
}
