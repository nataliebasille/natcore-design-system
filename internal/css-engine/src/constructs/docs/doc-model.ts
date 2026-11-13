import type { ShowcaseJsxChild } from "@nataliebasille/preview-jsx-runtime";
import { Fragment } from "@nataliebasille/preview-jsx-runtime/jsx-runtime";
import type { ComponentBuilder } from "../components/component-builder";
import {
  createDoc,
  type ComponentDoc,
  type DocComponentMeta,
} from "../components/component-doc";
import {
  resolvePlaygroundControls,
  type PlaygroundControlValue,
  type ResolvedControl,
} from "./controls";
import {
  getDocMarker,
  isDocMarker,
  type DocMarkerKind,
  type DocNav,
  type DocTableRow,
  type SectionProps,
} from "./markers";

export type DocSectionContent =
  | { kind: "prose"; node: ShowcaseJsxChild }
  | {
      kind: "example";
      title?: string;
      description?: string;
      table?: DocTableRow[];
      source: ShowcaseJsxChild;
    };

export type DocSectionEntityKind =
  | "component"
  | "utility"
  | "slots"
  | "custom-variants";

export type DocSectionBlock = {
  kind: "section";
  title: string;
  description?: string;
  table?: DocTableRow[];
  of?: string;
  entityKind?: DocSectionEntityKind;
  /** The component or utility a keyed section documents. */
  entity?: ComponentDoc["components"][string];
  /** The slots or custom variants an `@slots` / `@custom-variants` section documents. */
  derived?: NonNullable<ComponentDoc["slots"]>;
  content: DocSectionContent[];
};

export type DocPlaygroundBlock = {
  kind: "playground";
  controls: ResolvedControl[];
  render: (values: Record<string, PlaygroundControlValue>) => ShowcaseJsxChild;
};

export type DocBlock =
  | { kind: "prose"; node: ShowcaseJsxChild }
  | DocSectionBlock
  | DocPlaygroundBlock;

export type DocModel = {
  title: string;
  description: string;
  atAGlance?: ShowcaseJsxChild;
  nav?: DocNav;
  blocks: DocBlock[];
  /** Generated from the builder; absent for pages without one. */
  api?: ComponentDoc;
  /** Authoring mistakes. The offending part is skipped or rendered plainly. */
  issues: string[];
};

const SLOTS_KEY = "@slots";
const CUSTOM_VARIANTS_KEY = "@custom-variants";

/**
 * Turns a `*.docs.tsx` default export into a plain page model. Accepts
 * `unknown` because docs modules are loaded by path.
 */
export function toDocModel(tree: unknown): DocModel {
  if (!isDocMarker(tree, "page")) {
    return {
      title: "",
      description: "",
      blocks: [],
      issues: ["A docs file must export a <Page> as its default export."],
    };
  }

  const page = tree.props;
  const builder = getDocMarker(tree)?.builder;
  const children = flatten(page.children);
  const sections = children
    .filter((child) => isDocMarker(child, "section"))
    .map((section) => section.props);
  const api =
    builder && buildApi(builder, page.title, page.description, sections);

  const issues: string[] = [];
  const blocks: DocBlock[] = [];

  for (const child of children) {
    if (isDocMarker(child, "section")) {
      blocks.push(toSectionBlock(child.props, builder, api, issues));
      continue;
    }

    if (isDocMarker(child, "playground")) {
      if (blocks.some((b) => b.kind === "playground")) {
        issues.push(
          "A page can have only one <Playground>; extras are ignored.",
        );
        continue;
      }

      const resolved = resolvePlaygroundControls(builder, child.props.controls);
      issues.push(...resolved.issues);
      if (!resolved.controls) continue;
      blocks.push({
        kind: "playground",
        controls: resolved.controls,
        render: child.props.render,
      });
      continue;
    }

    const misplaced = getDocMarker(child)?.kind;
    if (misplaced) {
      issues.push(misplacedMarkerIssue(misplaced, "page"));
      continue;
    }

    reportNestedMarkers(child, "page", issues);
    blocks.push({ kind: "prose", node: child });
  }

  return {
    title: page.title,
    description: page.description,
    ...(page.atAGlance !== undefined ? { atAGlance: page.atAGlance } : {}),
    ...(page.nav ? { nav: page.nav } : {}),
    blocks,
    ...(api ? { api } : {}),
    issues,
  };
}

function buildApi(
  builder: ComponentBuilder,
  title: string,
  description: string,
  sections: SectionProps[],
): ComponentDoc {
  const entities: Record<string, Partial<DocComponentMeta>> = {};
  const cssvars: Record<string, string> = {};

  for (const section of sections) {
    Object.assign(cssvars, section.vars);
    if (section.of === undefined) continue;
    entities[section.of] = {
      ...(section.title !== undefined ? { name: section.title } : {}),
      ...(section.description !== undefined ?
        { description: section.description }
      : {}),
    };
  }

  return createDoc(builder, {
    title,
    description,
    components: entities,
    utilities: entities,
    cssvars,
    slots: entities[SLOTS_KEY] && {
      title: entities[SLOTS_KEY].name,
      description: entities[SLOTS_KEY].description,
    },
    customVariants: entities[CUSTOM_VARIANTS_KEY] && {
      title: entities[CUSTOM_VARIANTS_KEY].name,
      description: entities[CUSTOM_VARIANTS_KEY].description,
    },
  });
}

function toSectionBlock(
  props: SectionProps,
  builder: ComponentBuilder | undefined,
  api: ComponentDoc | undefined,
  issues: string[],
): DocSectionBlock {
  const block: DocSectionBlock = {
    kind: "section",
    title: props.title ?? props.of ?? "",
    ...(props.description !== undefined ?
      { description: props.description }
    : {}),
    ...(props.table ? { table: props.table } : {}),
    content: toSectionContent(props.children, issues),
  };

  if (props.of === undefined) return block;

  if (!api) {
    issues.push(
      `<Section of="${props.of}"> needs a page created with docsFor(builder).`,
    );
    return block;
  }

  if (props.of === SLOTS_KEY || props.of === CUSTOM_VARIANTS_KEY) {
    const derived = props.of === SLOTS_KEY ? api.slots : api.customVariants;
    if (derived) {
      return {
        ...block,
        title: derived.title,
        of: props.of,
        entityKind: props.of === SLOTS_KEY ? "slots" : "custom-variants",
        derived,
      };
    }
  } else {
    const component = api.components[props.of];
    const entity = component ?? api.utilities[props.of];
    if (entity) {
      return {
        ...block,
        title: entity.name,
        of: props.of,
        entityKind: component ? "component" : "utility",
        entity,
      };
    }
  }

  issues.push(
    `<Section of="${props.of}"> does not match anything in "${rootName(builder)}".`,
  );
  return block;
}

function toSectionContent(
  children: ShowcaseJsxChild,
  issues: string[],
): DocSectionContent[] {
  const content: DocSectionContent[] = [];

  for (const child of flatten(children)) {
    if (isDocMarker(child, "example")) {
      const { children: source, ...rest } = child.props;
      reportNestedMarkers(source, "example", issues);
      content.push({ kind: "example", ...rest, source });
      continue;
    }

    const misplaced = getDocMarker(child)?.kind;
    if (misplaced) {
      issues.push(misplacedMarkerIssue(misplaced, "section"));
      continue;
    }

    reportNestedMarkers(child, "section", issues);
    content.push({ kind: "prose", node: child });
  }

  return content;
}

type MarkerContext = "page" | "section" | "example";

function reportNestedMarkers(
  child: ShowcaseJsxChild,
  context: MarkerContext,
  issues: string[],
) {
  if (Array.isArray(child)) {
    child.forEach((c) => reportNestedMarkers(c, context, issues));
    return;
  }

  if (typeof child !== "object" || child === null) return;

  const misplaced = getDocMarker(child)?.kind;
  if (misplaced) {
    issues.push(misplacedMarkerIssue(misplaced, context));
  } else if (typeof child.type === "function") {
    // A helper component: check what it renders.
    reportNestedMarkers(child.type(child.props), context, issues);
    return;
  }

  reportNestedMarkers(child.props.children, context, issues);
}

function misplacedMarkerIssue(kind: DocMarkerKind, context: MarkerContext) {
  switch (kind) {
    case "page":
      return "<Page> must be the root of a docs file.";
    case "section":
      return "<Section> must be a direct child of <Page>.";
    case "playground":
      return "<Playground> must be a direct child of <Page>.";
    case "example":
      return (
        context === "page" ? "<Example> must be inside a <Section>."
        : context === "section" ?
          "<Example> must be a direct child of <Section>."
        : "<Example> cannot be inside another <Example>."
      );
  }
}

function rootName(builder: ComponentBuilder | undefined) {
  let state = builder?.state;
  while (state?.parent) state = state.parent;
  return state?.name ?? "";
}

// Expands fragments and helper components (never markers), so what a helper
// renders is placed and validated as if it were written inline.
function flatten(children: ShowcaseJsxChild): ShowcaseJsxChild[] {
  if (Array.isArray(children)) return children.flatMap(flatten);
  if (children === null || children === undefined) return [];
  if (typeof children === "boolean") return [];
  if (typeof children === "string" && children.trim() === "") return [];
  if (typeof children === "object" && children.type === Fragment) {
    return flatten(children.props.children);
  }
  if (
    typeof children === "object" &&
    typeof children.type === "function" &&
    !getDocMarker(children)
  ) {
    return flatten(children.type(children.props));
  }
  return [children];
}
