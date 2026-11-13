import type {
  ShowcaseJsxChild,
  ShowcaseJsxNode,
} from "@nataliebasille/preview-jsx-runtime";
import { Fragment, jsx } from "@nataliebasille/preview-jsx-runtime/jsx-runtime";
import type { ComponentBuilder } from "../components/component-builder";
import type { ComponentDocMeta } from "../components/component-doc";
import type { ComponentState } from "../components/types";
import type {
  PlaygroundControlsInput,
  PlaygroundControls,
  PlaygroundControlValue,
  PlaygroundValues,
  ResolvedPlaygroundValues,
} from "./controls";

export type DocTableRow = { label: string; content: ShowcaseJsxChild };

/** Where a docs page appears in the site navigation. Every field is optional. */
export type DocNav = {
  /** Sidebar label. Defaults to the page title. */
  label?: string;
  /** Sidebar group. Defaults to the file's folders; `""` puts the page at the top level. */
  group?: string;
  /** Sort order within the group (lower first); unordered pages sort by label after ordered ones. */
  order?: number;
  /** URL path, e.g. `/core/tokens`. Defaults to the file's location. */
  path?: string;
};

export type PageProps = {
  title: string;
  description: string;
  atAGlance?: ShowcaseJsxChild;
  nav?: DocNav;
  children?: ShowcaseJsxChild;
};

type SectionBase<V extends string> = {
  description?: string;
  /** Descriptions for the component's CSS variables, shown in the API reference. */
  vars?: Partial<Record<V, string>>;
  table?: DocTableRow[];
  children?: ShowcaseJsxChild;
};

export type SectionProps<
  K extends string = string,
  V extends string = string,
> =
  | (SectionBase<V> & { of: K; title?: string })
  | (SectionBase<V> & { of?: undefined; title: string });

export type ExampleProps = {
  title?: string;
  description?: string;
  /** Reference rows rendered beneath the example and its code. */
  table?: DocTableRow[];
  children?: ShowcaseJsxChild;
};

export type PlaygroundProps = {
  controls?: PlaygroundControls;
  // Method syntax so a typed `render` (e.g. `(v: { variant: "solid" }) => …`) is accepted.
  render(values: Record<string, PlaygroundControlValue>): ShowcaseJsxChild;
};

type MarkerProps = {
  page: PageProps;
  section: SectionProps;
  example: ExampleProps;
  playground: PlaygroundProps;
};

export type DocMarkerKind = keyof MarkerProps;

export type DocMarker = {
  kind: DocMarkerKind;
  builder?: ComponentBuilder;
};

export type DocMarkerNode<K extends DocMarkerKind> = ShowcaseJsxNode & {
  props: MarkerProps[K];
};

export type SectionKey<B extends ComponentBuilder> =
  B extends ComponentBuilder<infer S> ?
    | (keyof ComponentDocMeta<B>["components"] & string)
    | (ComponentDocMeta<B> extends { utilities: infer U } ? keyof U & string
      : never)
    | ([ChainKeys<S, "slots">] extends [never] ? never : "@slots")
    | ([ChainKeys<S, "guards">] extends [never] ? never : "@custom-variants")
  : never;

export type CssVarKey<B extends ComponentBuilder> =
  ComponentDocMeta<B> extends { cssvars: infer C } ? keyof C & string : never;

export type PlaygroundComponent<D> = <
  const C extends PlaygroundControlsInput<D, C> = {},
>(props: {
  controls?: C;
  render: (values: ResolvedPlaygroundValues<D, C>) => ShowcaseJsxChild;
}) => ShowcaseJsxNode;

type ChainKeys<S extends ComponentState, P extends "slots" | "guards"> =
  | (keyof S[P] & string)
  | (S extends { parent: infer Parent extends ComponentState } ?
      ChainKeys<Parent, P>
    : never);

const markers = new WeakMap<object, DocMarker>();

/**
 * Building blocks for a component's `*.docs.tsx` page. `Section of` only
 * accepts the builder's components, utilities, `@slots`, and
 * `@custom-variants`; `Playground` derives its controls from the builder.
 */
export function docsFor<B extends ComponentBuilder>(builder: B) {
  return {
    Page: createMarker<PageProps>({ kind: "page", builder }, childrenOf),
    Section: createMarker<SectionProps<SectionKey<B>, CssVarKey<B>>>(
      { kind: "section" },
      childrenOf,
    ),
    Example: createMarker<ExampleProps>({ kind: "example" }, childrenOf),
    Playground: createPlayground<PlaygroundValues<B>>(),
  };
}

/** Building blocks for a page with no component (guides). */
export function docs() {
  return {
    Page: createMarker<PageProps>({ kind: "page" }, childrenOf),
    Section: createMarker<SectionProps<never, never>>(
      { kind: "section" },
      childrenOf,
    ),
    Example: createMarker<ExampleProps>({ kind: "example" }, childrenOf),
    Playground: createPlayground<{}>(),
  };
}

export function isDocMarker<K extends DocMarkerKind>(
  child: unknown,
  kind: K,
): child is DocMarkerNode<K> {
  return getDocMarker(child)?.kind === kind;
}

export function getDocMarker(child: unknown): DocMarker | undefined {
  return (
      typeof child === "object" &&
        child !== null &&
        "type" in child &&
        typeof child.type === "function"
    ) ?
      markers.get(child.type)
    : undefined;
}

function createPlayground<D>(): PlaygroundComponent<D> {
  return createMarker<PlaygroundProps>({ kind: "playground" }, () => null);
}

// Rendered outside the docs pipeline, a marker renders `render(props)`.
function createMarker<P>(
  marker: DocMarker,
  render: (props: P) => ShowcaseJsxChild,
) {
  const component = (props: P): ShowcaseJsxNode =>
    jsx(Fragment, { children: render(props) });
  markers.set(component, marker);
  return component;
}

function childrenOf(props: { children?: ShowcaseJsxChild }) {
  return props.children;
}
