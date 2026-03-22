import { Fragment, type ReactNode } from "react";

export type UtilityTag =
  | "utility"
  | "modifier"
  | "composable"
  | "component"
  | "slot"
  | "css-variable";

type TableRow = { label: string; content: ReactNode };

type UtilityReferenceProps = {
  tags?: UtilityTag[];
  description?: string;
  table: TableRow[];
};

type UtilityValueProps = {
  values: string[];
  divider?: string;
};

export const UtilityValue = ({ values, divider = "/" }: UtilityValueProps) => {
  return (
    <>
      {values.map((value, i) => (
        <Fragment key={value}>
          <span>{value}</span>
          {i < values.length - 1 && (
            <span className="mx-1 text-on-tone-50-surface/40">{divider}</span>
          )}
        </Fragment>
      ))}
    </>
  );
};

const TAG_CLASSES: Record<UtilityTag, string> = {
  component: "badge-solid/primary",
  modifier: "badge-soft/primary",
  composable: "badge-solid/secondary",
  utility: "badge-solid/surface",
  slot: "badge-soft/accent",
  "css-variable": "badge-soft/surface",
};

export const TagBadge = ({ tag }: { tag: UtilityTag }) => (
  <span className={`${TAG_CLASSES[tag]} inline-block`}>{tag}</span>
);

export const UtilityReference = ({
  tags,
  description,
  table,
}: UtilityReferenceProps) => {
  return (
    <div className="space-y-4">
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="mt-0! text-tone-950-surface/60">{description}</p>
      )}

      {/* Reference table */}
      <div className="grid grid-cols-[160px_1fr] items-start gap-px overflow-hidden rounded-lg border border-tone-300-surface/40 bg-tone-300-surface/40">
        {table.map(({ label, content }) => (
          <div
            key={label}
            className="col-span-2 row-span-1 grid grid-cols-subgrid grid-rows-subgrid gap-px"
          >
            <div className="bg-tone-50-surface px-4 py-2.5 text-sm tracking-wide">
              {label}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-tone-50-surface px-4 py-2.5 text-sm text-on-tone-50-surface/80">
              {content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
