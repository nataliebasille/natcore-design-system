/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { ListControlValues } from "./list-playground-controls";
import { twMerge } from "tailwind-merge";

const listClassNames = {
  plain: {
    primary: "list/primary",
    secondary: "list/secondary",
    accent: "list/accent",
    surface: "list/surface",
    success: "list/success",
    danger: "list/danger",
    disabled: "list/disabled",
  },
  disc: {
    primary: "list-disc/primary",
    secondary: "list-disc/secondary",
    accent: "list-disc/accent",
    surface: "list-disc/surface",
    success: "list-disc/success",
    danger: "list-disc/danger",
    disabled: "list-disc/disabled",
  },
  decimal: {
    primary: "list-decimal/primary",
    secondary: "list-decimal/secondary",
    accent: "list-decimal/accent",
    surface: "list-decimal/surface",
    success: "list-decimal/success",
    danger: "list-decimal/danger",
    disabled: "list-decimal/disabled",
  },
} satisfies Record<
  ListControlValues["variant"],
  Record<ListControlValues["palette"], string>
>;

export function getListPlaygroundShowcase(values: ListControlValues) {
  const listClassName = twMerge(listClassNames[values.variant][values.palette]);

  const items = [
    ["first", "Profile"],
    ["second", "Security"],
    ["third", "Notifications"],
  ] as const;

  const ListElement = values.variant === "decimal" ? "ol" : "ul";

  return (
    <ui-div className="w-full rounded-2xl border border-surface-300/50 bg-surface-50 p-4 text-sm text-on-surface-50/80">
      <ListElement className={listClassName}>
        {items.map(([key, label]) => (
          <li
            key={key}
            data-slot="item"
            className={key === "second" ? "active" : undefined}
          >
            {label}
          </li>
        ))}
      </ListElement>
    </ui-div>
  );
}
