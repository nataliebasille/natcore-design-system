import { Fragment, type ReactNode } from "react";

export type UtilityTag = "utility" | "modifier" | "composable" | "component";

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
            <span key={tag} className="badge-solid/primary">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-tone-950-surface/60 text-sm">{description}</p>
      )}

      {/* Reference table */}
      <div className="border-tone-300-surface/40 divide-tone-300-surface/40 overflow-hidden rounded-lg border divide-y">
        {table.map(({ label, content }) => (
          <div
            key={label}
            className="grid grid-cols-[160px_1fr] items-start bg-tone-50-surface"
          >
            <div className="border-tone-300-surface/40 text-on-tone-50-surface/60 border-r px-4 py-2.5 text-sm tracking-wide">
              {label}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 text-sm text-on-tone-50-surface/80">
              {content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
