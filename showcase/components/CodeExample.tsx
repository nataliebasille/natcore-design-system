import { highlight } from "@/utlls/syntax-highlighter";
import { type System, getSystemFileType } from "@/utlls/systems";
import fs from "fs";

export const CodeExample = async ({
  component,
  system,
}: {
  component: string;
  system: System;
}) => {
  const filetype = getSystemFileType(system);
  console.log(import.meta.url);
  const file = await fs.promises.readFile(
    new URL(
      `../app/component/${component}/examples/${system}.${filetype}`,
      import.meta.url,
    ),
    "utf8",
  );

  return (
    <code
      dangerouslySetInnerHTML={{ __html: highlight(file, { lang: "native" }) }}
    />
  );
};
