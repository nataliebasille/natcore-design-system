import type { ComponentState } from "./types";
import { traverseBottomUp } from "./utils";

export function resolveSlotSelector(
  name: string,
  slotsMap: ComponentState["slots"],
): string {
  const slot = slotsMap[name];
  const selector = slot?.selector;

  return (
    selector === "class" ? `.${name}`
    : selector === "data-attr" ? `[data-slot="${name}"]`
    : (selector ?? name)
  );
}
