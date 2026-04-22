/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { CardControlValues } from "./card-playground-controls";

export function getCardPlaygroundShowcase(values: CardControlValues) {
  const className = [
    `card-${values.variant}/${values.palette}`,
    values.hover ? "card-hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      <div data-slot="header" className="flex flex-col gap-1">
        <span className="text-xs tracking-[0.18em] uppercase opacity-70">
          Interactive
        </span>
        <h3 className="text-lg font-semibold">{values.title}</h3>
      </div>

      <div data-slot="content" className="space-y-3 text-sm opacity-90">
        <p>
          Switch variants, palettes, and hover behavior to see how the card
          surface and generated markup change together.
        </p>
      </div>

      {values.footer && (
        <div
          data-slot="footer"
          className="flex items-center justify-between gap-3 text-xs opacity-75"
        >
          <span>{values.hover ? "Hover enabled" : "Hover disabled"}</span>
          <span>{`card-${values.variant}/${values.palette}`}</span>
        </div>
      )}
    </article>
  );
}
