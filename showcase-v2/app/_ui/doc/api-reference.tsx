import { Fragment, type ReactNode } from "react";
import {
  parseAllConstructs,
  type ComponentMeta,
  type CustomVariantMeta,
  type ThemeMeta,
  type UtilityMeta,
} from "@/utlls/construct-metadata";
import { UtilityValue, TagBadge } from "./utility-reference";

const DEFAULT_TONES = ["primary", "secondary", "accent", "surface"];

export type SlotClass = {
  /** The class name (e.g. ".toggle-thumb"). */
  name: string;
  /** Optional short description shown in the right column. */
  description?: string;
};

export type VariantInfo = {
  /** The variant name without the trailing colon (e.g. "toggle-on"). */
  name: string;
  /** Optional short description shown below the condition selector. */
  description?: string;
};

export type CssVarInfo = {
  /** The CSS variable name (e.g. "--toggle-h"). */
  name: string;
  /** Optional short description shown above the default value. */
  description?: string;
};

type CssApiReferenceProps = {
  /**
   * The default export of a `.css.ts` file — an array of css-engine constructs.
   * All construct kinds (component, utility, theme, custom-variant) are parsed
   * and rendered.
   */
  constructs: unknown[];
  /** Tone palette names shown for component classes. Defaults to the four design-system tones. */
  tones?: string[];
  /**
   * Slot classes — child element classes used inside the component that are
   * not top-level constructs (e.g. `.toggle-thumb`). These are displayed under
   * a "Slot Classes" heading in the API reference.
   */
  slots?: SlotClass[];
  /**
   * Extra info for custom variants parsed from the `.css.ts` file. Use this to
   * attach descriptions to auto-detected variants (e.g. `toggle-on`).
   */
  variants?: VariantInfo[];
  /**
   * Extra info for CSS variables parsed from the `.css.ts` file. Use this to
   * attach descriptions to auto-detected variables (e.g. `--toggle-h`).
   */
  cssVars?: CssVarInfo[];
};

/**
 * Renders a comprehensive API-reference block derived from a `.css.ts` file
 * export. Groups output into three sections:
 *
 * - **Classes** — component and utility class patterns with their variants / modifiers
 * - **CSS Variables** — theme custom properties with their default values
 * - **Tailwind Variants** — custom variant names registered via `dsl.atRule("custom-variant", …)`
 *
 * Place this inside a `<DocSection title="API Reference">` as the last section
 * on a documentation page:
 *
 * ```tsx
 * import toggleCss from "…/toggle.css.ts";
 * import { CssApiReference } from "@/app/_ui/doc/api-reference";
 *
 * <DocSection title="API Reference">
 *   <CssApiReference constructs={toggleCss} />
 * </DocSection>
 * ```
 */
export const CssApiReference = ({
  constructs,
  tones = DEFAULT_TONES,
  slots,
  variants: variantInfos,
  cssVars: cssVarInfos,
}: CssApiReferenceProps) => {
  const all = parseAllConstructs(constructs);

  const components = all.filter(
    (m): m is ComponentMeta => m.kind === "component",
  );
  const utilities = all.filter((m): m is UtilityMeta => m.kind === "utility");
  const allVars = all
    .filter((m): m is ThemeMeta => m.kind === "theme")
    .flatMap((t) => t.variables);
  const customVariants = all.filter(
    (m): m is CustomVariantMeta => m.kind === "custom-variant",
  );

  // Merge auto-parsed metadata with any manually provided info
  const variantInfoMap = new Map((variantInfos ?? []).map((v) => [v.name, v]));
  const cssVarInfoMap = new Map((cssVarInfos ?? []).map((v) => [v.name, v]));

  const hasClasses = components.length > 0 || utilities.length > 0;

  return (
    <div className="space-y-8">
      {/* ── Classes ── */}
      {hasClasses && (
        <ApiGroup label="Classes">
          {components.map((meta) => (
            <ApiRow
              key={meta.name}
              label={<Pattern text={`${meta.name}-{variant}/{tone}`} />}
            >
              <TagBadge tag="component" />
              <div className="mt-2 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-1 text-xs">
                <span className="text-on-tone-50-surface/60">Variant</span>
                <div className="flex flex-wrap gap-1.5">
                  <UtilityValue values={meta.variants} />
                </div>
                <span className="text-on-tone-50-surface/60">Palette</span>
                <div className="flex flex-wrap gap-1.5">
                  <UtilityValue values={tones} />
                </div>
              </div>
            </ApiRow>
          ))}
          {utilities.map((meta) => {
            const seg = lastSegment(meta.name);
            const pattern =
              meta.modifiers.length > 0 ? `${meta.name}-{${seg}}` : meta.name;
            return (
              <ApiRow key={meta.name} label={<Pattern text={pattern} />}>
                <TagBadge tag="modifier" />
                {meta.modifiers.length > 0 && (
                  <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-1 text-xs">
                    <span className="text-on-tone-50-surface/60">
                      {capitalize(seg)}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <UtilityValue values={meta.modifiers} />
                    </div>
                  </div>
                )}
              </ApiRow>
            );
          })}
        </ApiGroup>
      )}

      {/* ── CSS Variables ── */}
      {allVars.length > 0 && (
        <ApiGroup label="CSS Variables">
          {allVars.map((v) => {
            const extra = cssVarInfoMap.get(v.name);
            return (
              <ApiRow
                key={v.name}
                label={<span className="font-mono text-sm">{v.name}</span>}
              >
                <span className="flex flex-col items-start gap-1.5 text-xs">
                  <TagBadge tag="css-variable" />
                  {extra?.description && (
                    <span className="text-on-tone-50-surface/80">
                      {extra.description}
                    </span>
                  )}
                  {v.default && (
                    <span className="flex gap-1">
                      <span className="text-on-tone-50-surface/60">
                        Default:{" "}
                      </span>
                      <span className="text-tone-500-accent">{v.default}</span>
                    </span>
                  )}
                </span>
              </ApiRow>
            );
          })}
        </ApiGroup>
      )}

      {/* ── Slot Classes ── */}
      {slots && slots.length > 0 && (
        <ApiGroup label="Slot Classes">
          {slots.map((s) => (
            <ApiRow
              key={s.name}
              label={<span className="font-mono text-sm">{s.name}</span>}
            >
              <span className="flex flex-col items-start gap-1.5 text-xs">
                <TagBadge tag="slot" />
                {s.description && (
                  <span className="text-on-tone-50-surface/80">
                    {s.description}
                  </span>
                )}
              </span>
            </ApiRow>
          ))}
        </ApiGroup>
      )}

      {/* ── Variants ── */}
      {customVariants.length > 0 && (
        <ApiGroup label="Variants">
          {customVariants.map((v) => {
            const extra = variantInfoMap.get(v.name);
            return (
              <ApiRow
                key={v.name}
                label={<span className="font-mono text-sm">{v.name}:</span>}
              >
                <span className="flex flex-col gap-0.5 text-xs">
                  {v.condition && (
                    <>
                      <span className="text-on-tone-50-surface/60">
                        Selector:{" "}
                      </span>
                      <span className="break-all text-tone-500-accent">
                        {v.condition}
                      </span>
                    </>
                  )}
                  {extra?.description && (
                    <span className="mt-1 text-on-tone-50-surface/80">
                      {extra.description}
                    </span>
                  )}
                </span>
              </ApiRow>
            );
          })}
        </ApiGroup>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

const ApiGroup = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <p className="mb-2 text-xs font-semibold tracking-widest text-on-tone-50-surface/50 uppercase">
      {label}
    </p>
    <div className="grid grid-cols-[minmax(180px,220px)_1fr] items-start gap-px overflow-hidden rounded-lg border border-tone-300-surface/40 bg-tone-300-surface/40">
      {children}
    </div>
  </div>
);

const ApiRow = ({
  label,
  children,
}: {
  label: ReactNode;
  children?: ReactNode;
}) => (
  <div className="col-span-2 grid grid-cols-subgrid gap-px">
    <div className="bg-tone-50-surface px-4 py-3 text-sm">{label}</div>
    <div className="bg-tone-50-surface px-4 py-3 text-sm">{children}</div>
  </div>
);

const Pattern = ({ text }: { text: string }) => {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <span className="font-mono text-sm">
      {parts.map((part, i) =>
        part.startsWith("{") ?
          <span key={i} className="text-tone-500-accent">
            {part}
          </span>
        : <Fragment key={i}>{part}</Fragment>,
      )}
    </span>
  );
};

function lastSegment(name: string): string {
  const idx = name.lastIndexOf("-");
  return idx === -1 ? name : name.slice(idx + 1);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
