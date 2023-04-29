export type System = "native" | "react";

const SystemToFileTypeMap = {
  native: "html",
  react: "tsx",
} as const;

export const getSystemFileType = (system: System) =>
  SystemToFileTypeMap[system];
