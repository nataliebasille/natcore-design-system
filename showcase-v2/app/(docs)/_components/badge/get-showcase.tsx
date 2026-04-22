/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { BadgeControlValues } from "./badge-playground-controls";

export function getBadgePlaygroundShowcase(values: BadgeControlValues) {
  const badgeClassName = `badge-${values.variant}/${values.palette}`;
  const label = values.label.trim() || "Badge";

  return (
    <ui-div className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-tone-300-surface/50 bg-tone-50-surface p-4 text-sm text-on-tone-50-surface/70">
      <span>Release 2.3.0</span>
      <span className={badgeClassName}>{label}</span>
      <span>ready for rollout</span>
    </ui-div>
  );
}
