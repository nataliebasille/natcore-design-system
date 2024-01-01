import { type System, getSystemFileType } from "@/utlls/systems";
import { fetchFile } from "./fetch-file";

export function fetchExample({
  category,
  component,
  system,
}: {
  category: "form" | "component";
  component: string;
  system: System;
}) {
  const filetype = getSystemFileType(system);
  const path = `${category}/${component}/examples/${system}.${filetype}`;

  return fetchFile(path);
}
