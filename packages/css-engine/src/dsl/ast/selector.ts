/**
 * DSL layer - provides type-safe selector creation and validation
 */

const ELEMENT_SELECTOR_REGEX = /^[a-z][a-z0-9-]*$/i;

type ElementSelector = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;

/**
 * Valid CSS selector patterns
 */
export type Selector =
  | "*" // any/universal
  | `.${string}` // class
  | `#${string}` // id
  | `[${string}]` // attribute
  | `:${string}` // pseudo-class
  | `::${string}` // pseudo-element
  | `&${string}` // parent reference
  | `${string} ${string}` // descendant combinator
  | `${string} > ${string}` // child combinator
  | `${string} + ${string}` // adjacent sibling combinator
  | `${string} ~ ${string}` // general sibling combinator
  | ElementSelector; // element selector

/**
 * Helper to create a valid element selector
 */
export function element<T extends string>(tag: T): Lowercase<T> {
  if (!ELEMENT_SELECTOR_REGEX.test(tag)) {
    throw new Error(`Invalid element selector: ${tag}`);
  }
  return tag.toLowerCase() as Lowercase<T>;
}

/**
 * Helper to create an any/universal selector (*)
 */
export function any(): "*" {
  return "*";
}

/**
 * Helper to create a class selector
 */
export function cls<T extends string>(className: T): `.${T}` {
  return `.${className}`;
}

/**
 * Helper to create an id selector
 */
export function id<T extends string>(idName: T): `#${T}` {
  return `#${idName}`;
}

/**
 * Helper to create an attribute selector
 */
export function attr<T extends string>(attribute: T): `[${T}]` {
  return `[${attribute}]`;
}

/**
 * Helper to create a pseudo-class selector
 */
export function pseudo<T extends string>(pseudoClass: T): `:${T}` {
  return `:${pseudoClass}`;
}

/**
 * Helper to create a pseudo-element selector
 */
export function pseudoElement<T extends string>(pseudoEl: T): `::${T}` {
  return `::${pseudoEl}`;
}

/**
 * Helper to create a parent reference selector
 */
export function parent<T extends string = "">(suffix?: T): `&${T}` {
  return `&${suffix ?? ""}` as `&${T}`;
}

/**
 * Descendant combinator: parent descendant
 */
export function descendant<P extends string, C extends string>(
  parent: P,
  child: C,
): `${P} ${C}` {
  return `${parent} ${child}` as `${P} ${C}`;
}

/**
 * Child combinator: parent > child
 */
export function child<P extends string, C extends string>(
  parent: P,
  child: C,
): `${P} > ${C}` {
  return `${parent} > ${child}` as `${P} > ${C}`;
}

/**
 * Adjacent sibling combinator: prev + next
 */
export function adjacent<P extends string, N extends string>(
  prev: P,
  next: N,
): `${P} + ${N}` {
  return `${prev} + ${next}` as `${P} + ${N}`;
}

/**
 * General sibling combinator: prev ~ sibling
 */
export function sibling<P extends string, N extends string>(
  prev: P,
  next: N,
): `${P} ~ ${N}` {
  return `${prev} ~ ${next}` as `${P} ~ ${N}`;
}

type CompoundValue<S extends string[]> =
  S extends [infer First extends string, ...infer Rest extends string[]] ?
    Rest extends [] ?
      First
    : `${First}${CompoundValue<Rest>}`
  : string;

/**
 * Compound selector: combines multiple selectors without space (e.g., div.class#id)
 */
export function compound<S extends string[]>(
  ...selectors: S
): CompoundValue<S> {
  return selectors.join("") as any;
}

type ListValue<S extends string[]> =
  S extends [infer First extends string, ...infer Rest extends string[]] ?
    Rest extends [] ?
      First
    : `${First}, ${ListValue<Rest>}`
  : string;

/**
 * Selector list: multiple selectors separated by comma
 */
export function list<S extends string[]>(...selectors: S): ListValue<S> {
  return selectors.join(", ") as ListValue<S>;
}
