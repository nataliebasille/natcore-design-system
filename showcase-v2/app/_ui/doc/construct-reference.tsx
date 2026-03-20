import { Fragment } from "react";
import {
  parseConstructs,
  type ComponentMeta,
  type ConstructMeta,
  type UtilityMeta,
} from "@/utlls/construct-metadata";
import {
  UtilityReference,
  UtilityValue,
  type UtilityTag,
} from "./utility-reference";

const DEFAULT_TONES = ["primary", "secondary", "accent", "surface"];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

type ConstructReferenceProps = {
  meta: ConstructMeta;
  /** Tone palette names.  Defaults to the four design-system tones. */
  tones?: string[];
  /** Optional description rendered below the chips */
  description?: string;
  /** Other class-name patterns that this construct can be composed with. */
  composedWith?: string[];
};

/**
 * Renders a single {@link UtilityReference} for one {@link ConstructMeta}.
 *
 * ```tsx
 * import buttonCss from "../../packages/core-v2/src/tailwind/components/button.css.ts";
 * import { CssFileReference } from "@/app/_ui/doc/construct-reference";
 *
 * <CssFileReference constructs={buttonCss} />
 * ```
 */
export const ConstructReference = ({
  meta,
  tones = DEFAULT_TONES,
  description,
  composedWith,
}: ConstructReferenceProps) =>
  meta.kind === "component" ?
    <ComponentReference
      meta={meta}
      tones={tones}
      composedWith={composedWith}
      description={description}
    />
  : <UtilityReferenceBlock
      meta={meta}
      composedWith={composedWith}
      description={description}
    />;

// ---------------------------------------------------------------------------
// Convenience wrapper — parses a whole .css.ts export at once
// ---------------------------------------------------------------------------

type CssFileReferenceProps = {
  /**
   * The default export of a `.css.ts` file, i.e. an array of css-engine
   * constructs (ComponentConstruct | UtilityConstruct | ThemeConstruct).
   */
  constructs: unknown[];
  /**
   * Name of the specific component or utility to render.  When omitted every
   * construct in the file is rendered.
   */
  for?: string;
  /** Optional description rendered below the chips */
  description?: string;
  /** Tone palette names.  Defaults to the four design-system tones. */
  tones?: string[];
};

/**
 * Parses an entire `.css.ts` default export and renders a
 * {@link UtilityReference} for each component and utility construct found.
 *
 * Use the `for` prop to render only a specific construct by name:
 * ```tsx
 * <CssFileReference constructs={buttonCss} for="btn" description="btn-{variant}/{tone}" />
 * <CssFileReference constructs={buttonCss} for="btn-size" description="btn-size-{size}" />
 * ```
 */
export const CssFileReference = ({
  constructs,
  for: forName,
  description,
  tones = DEFAULT_TONES,
}: CssFileReferenceProps) => {
  const allMetas = parseConstructs(constructs);
  const metas = forName ? allMetas.filter((m) => m.name === forName) : allMetas;

  const componentPatterns = allMetas
    .filter((m): m is ComponentMeta => m.kind === "component")
    .map((m) => `${m.name}-{variant}/{tone}`);

  const utilityPatterns = allMetas
    .filter((m): m is UtilityMeta => m.kind === "utility")
    .map((m) =>
      m.modifiers.length > 0 ? `${m.name}-{${lastSegment(m.name)}}` : m.name,
    );

  return (
    <>
      {metas.map((meta) => (
        <ConstructReference
          key={meta.name}
          meta={meta}
          description={description}
          tones={tones}
          composedWith={
            meta.kind === "component" ? utilityPatterns : componentPatterns
          }
        />
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------
// Internal renderers
// ---------------------------------------------------------------------------

type ComponentRefProps = {
  meta: ComponentMeta;
  tones: string[];
  composedWith?: string[];
  description?: string;
};

const ComponentReference = ({
  meta,
  tones,
  composedWith,
  description,
}: ComponentRefProps) => {
  const tags: UtilityTag[] = ["component", "composable"];
  const pattern = `${meta.name}-{variant}/{tone}`;

  const table = [
    { label: "Pattern", content: <Pattern text={pattern} /> },
    {
      label: "Variant",
      content: <UtilityValue values={meta.variants} />,
    },
    {
      label: "Palette",
      content: <UtilityValue values={tones} />,
    },
    ...(meta.defaultVariant ?
      [
        {
          label: "Default",
          content: (
            <span>
              {meta.name}-{meta.defaultVariant}
            </span>
          ),
        },
      ]
    : []),
    ...(composedWith && composedWith.length > 0 ?
      [
        {
          label: "Composes with",
          content: <UtilityValue values={composedWith} divider="+" />,
        },
      ]
    : []),
  ];

  return (
    <UtilityReference tags={tags} table={table} description={description} />
  );
};

type UtilityRefProps = {
  meta: UtilityMeta;
  composedWith?: string[];
  description?: string;
};

const UtilityReferenceBlock = ({
  meta,
  composedWith,
  description,
}: UtilityRefProps) => {
  const tags: UtilityTag[] = ["modifier"];
  const hasModifiers = meta.modifiers.length > 0;
  const pattern =
    hasModifiers ? `${meta.name}-{${lastSegment(meta.name)}}` : meta.name;

  const table = [
    { label: "Pattern", content: <Pattern text={pattern} /> },
    ...(hasModifiers ?
      [
        {
          label:
            lastSegment(meta.name).charAt(0).toUpperCase() +
            lastSegment(meta.name).slice(1),
          content: <UtilityValue values={meta.modifiers} />,
        },
      ]
    : []),
    ...(meta.defaultModifier ?
      [
        {
          label: "Default",
          content: (
            <span>
              {meta.name}-{meta.defaultModifier}
            </span>
          ),
        },
      ]
    : []),
    ...(composedWith && composedWith.length > 0 ?
      [
        {
          label: "Composes with",
          content: <UtilityValue values={composedWith} divider="+" />,
        },
      ]
    : []),
  ];

  return (
    <UtilityReference tags={tags} table={table} description={description} />
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Splits a pattern like "btn-size-{size}" into literal and placeholder spans. */
const Pattern = ({ text }: { text: string }) => {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <span>
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

/** Returns the last hyphen-separated word of a class name, e.g. "size" from "btn-size". */
function lastSegment(name: string): string {
  const idx = name.lastIndexOf("-");
  return idx === -1 ? name : name.slice(idx + 1);
}
