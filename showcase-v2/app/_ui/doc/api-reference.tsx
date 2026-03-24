import { Fragment, type ReactNode } from "react";
import {
  parseAllConstructs,
  type ComponentMeta,
  type CustomVariantMeta,
  type ThemeMeta,
  type UtilityMeta,
} from "@/utlls/construct-metadata";
import {
  UtilityValue,
  TagBadge,
  ApiGroup,
  ApiRow,
  type UtilityTag,
} from "./utility-reference";

/**
 * An `ApiRow` that shows its `TagBadge` in the label column on mobile
 * and in the right column on desktop — the standard responsive pattern
 * used throughout the API reference.
 */
const TaggedApiRow = ({
  tag,
  label,
  children,
}: {
  tag: UtilityTag;
  label: ReactNode;
  children?: ReactNode;
}) => (
  <ApiRow
    label={
      <div className="flex flex-col items-start gap-2 max-desktop:pb-2">
        <TagBadge tag={tag} className="desktop:hidden" />
        {label}
      </div>
    }
  >
    <TagBadge tag={tag} className="max-desktop:hidden" />
    {children}
  </ApiRow>
);

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
  /** Optional default value string shown when the variable is not auto-detected from a theme construct. */
  default?: string;
};

export type ClassInfo = {
  /** The construct name (e.g. "btn" or "btn-size"). */
  name: string;
  /** Optional short description rendered below the class pattern. */
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
   * CSS variable info. Augments auto-detected variables from `theme()` constructs
   * with descriptions. Variables listed here that are NOT auto-detected are still
   * rendered as standalone entries (useful for components that set CSS vars
   * inline rather than via a top-level `theme()` construct).
   */
  cssVars?: CssVarInfo[];
  /**
   * Descriptions for component and utility class patterns. Map construct names
   * (e.g. "btn", "btn-size") to human-readable descriptions shown in the Classes
   * section.
   */
  classes?: ClassInfo[];
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
  classes: classInfos,
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
  const classInfoMap = new Map((classInfos ?? []).map((c) => [c.name, c]));

  // CSS variables: auto-detected first, then any explicitly provided that
  // weren't in the CSS file (e.g. inline vars not in a top-level theme()).
  const autoVarNames = new Set(allVars.map((v) => v.name));
  const standaloneVars = (cssVarInfos ?? []).filter(
    (v) => !autoVarNames.has(v.name),
  );
  const hasVars = allVars.length > 0 || standaloneVars.length > 0;

  const hasClasses = components.length > 0 || utilities.length > 0;

  return (
    <div className="space-y-8">
      {/* ── Classes ── */}
      {hasClasses && (
        <ApiGroup label="Classes">
          {components.map((meta) => {
            const extra = classInfoMap.get(meta.name);
            return (
              <TaggedApiRow
                key={meta.name}
                tag="component"
                label={<Pattern text={`${meta.name}-{variant}/{tone}`} />}
              >
                {extra?.description && (
                  <div className="mb-2 text-xs text-on-tone-50-surface/70">
                    {extra.description}
                  </div>
                )}
                <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-1 text-xs desktop:mt-2">
                  <span className="text-on-tone-50-surface/60">Variant</span>
                  <div className="flex flex-wrap gap-1.5">
                    <UtilityValue values={meta.variants} />
                  </div>
                  <span className="text-on-tone-50-surface/60">Palette</span>
                  <div className="flex flex-wrap gap-1.5">
                    <UtilityValue values={tones} />
                  </div>
                </div>
              </TaggedApiRow>
            );
          })}
          {utilities.map((meta) => {
            const seg = lastSegment(meta.name);
            const pattern =
              meta.modifiers.length > 0 ? `${meta.name}-{${seg}}` : meta.name;
            const extra = classInfoMap.get(meta.name);
            return (
              <TaggedApiRow
                key={meta.name}
                tag="modifier"
                label={<Pattern text={pattern} />}
              >
                {extra?.description && (
                  <div className="mb-2 text-xs text-on-tone-50-surface/70">
                    {extra.description}
                  </div>
                )}
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
              </TaggedApiRow>
            );
          })}
        </ApiGroup>
      )}

      {/* ── CSS Variables ── */}
      {hasVars && (
        <ApiGroup label="CSS Variables">
          {allVars.map((v) => {
            const extra = cssVarInfoMap.get(v.name);
            return (
              <TaggedApiRow
                key={v.name}
                tag="css-variable"
                label={<span className="font-mono text-sm">{v.name}</span>}
              >
                <span className="flex flex-col items-start gap-1.5 text-xs">
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
              </TaggedApiRow>
            );
          })}
          {standaloneVars.map((v) => (
            <TaggedApiRow
              key={v.name}
              tag="css-variable"
              label={<span className="font-mono text-sm">{v.name}</span>}
            >
              <span className="flex flex-col items-start gap-1.5 text-xs">
                {v.description && (
                  <span className="text-on-tone-50-surface/80">
                    {v.description}
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
            </TaggedApiRow>
          ))}
        </ApiGroup>
      )}

      {/* ── Slot Classes ── */}
      {slots && slots.length > 0 && (
        <ApiGroup label="Slot Classes">
          {slots.map((s) => (
            <TaggedApiRow
              key={s.name}
              tag="slot"
              label={<span className="font-mono text-sm">{s.name}</span>}
            >
              {s.description && (
                <span className="text-on-tone-50-surface/80">
                  {s.description}
                </span>
              )}
            </TaggedApiRow>
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
