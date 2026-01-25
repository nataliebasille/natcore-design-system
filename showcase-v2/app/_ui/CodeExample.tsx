import { highlight } from "@/utlls/syntax-highlighter";
import { type System } from "@/utlls/systems";
import { fetchExample } from "./fetch-example";

export const CodeExample = async ({
  component,
  system,
  category = "components",
}: {
  category?: "forms" | "components";
  component: string;
  system: System;
}) => {
  const file = await fetchExample({ component, system, category });
  return (
    <code
      dangerouslySetInnerHTML={{ __html: highlight(file, { lang: "native" }) }}
    />
  );
};
