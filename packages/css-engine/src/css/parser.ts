import type {
  StylesheetAst,
  StylesheetSimpleAst,
  StyleProperties,
} from "./ast";
import { atRule, styleBlock, styleList } from "./ast";

type ParserState = {
  css: string;
  pos: number;
};

/**
 * Parse CSS text into a Stylesheet AST
 */
export function parse(css: string): StylesheetAst {
  const state: ParserState = { css, pos: 0 };
  skipWhitespace(state);
  const nodes: StylesheetSimpleAst[] = [];

  while (state.pos < state.css.length) {
    skipWhitespace(state);
    if (state.pos >= state.css.length) break;

    const node = parseTopLevel(state);
    if (node) {
      nodes.push(node);
    }
    skipWhitespace(state);
  }

  return nodes.length === 1 ? nodes[0]! : nodes;
}

function parseTopLevel(state: ParserState): StylesheetSimpleAst | null {
  skipWhitespace(state);

  // Check for at-rule
  if (peek(state) === "@") {
    return parseAtRule(state);
  }

  // Otherwise it's a style block
  return parseStyleBlock(state);
}

function parseAtRule(state: ParserState): StylesheetSimpleAst {
  expect(state, "@");
  const name = parseIdentifier(state);
  skipWhitespace(state);

  // Parse prelude until { or ;
  const preludeStart = state.pos;
  let depth = 0;
  while (state.pos < state.css.length) {
    const char = state.css[state.pos];
    if (char === "{" && depth === 0) {
      break;
    }
    if (char === ";" && depth === 0) {
      break;
    }
    if (char === "(") depth++;
    if (char === ")") depth--;
    state.pos++;
  }

  const prelude = state.css.slice(preludeStart, state.pos).trim() || null;
  skipWhitespace(state);

  // Check if it has a body or ends with semicolon
  if (peek(state) === ";") {
    state.pos++; // consume semicolon
    return atRule(name, prelude);
  }

  if (peek(state) === "{") {
    expect(state, "{");
    const body = parseBlock(state);
    expect(state, "}");
    return atRule(name, prelude, ...body);
  }

  return atRule(name, prelude);
}

function parseStyleBlock(state: ParserState): StylesheetSimpleAst {
  const selector = parseSelector(state);
  skipWhitespace(state);
  expect(state, "{");
  const body = parseBlock(state);
  expect(state, "}");

  return styleBlock(selector, body.length === 1 ? body[0]! : body);
}

function parseBlock(state: ParserState): Array<StylesheetSimpleAst> {
  skipWhitespace(state);
  const nodes: StylesheetSimpleAst[] = [];

  // Try to parse properties first
  const properties = tryParseProperties(state);
  if (properties && Object.keys(properties).length > 0) {
    nodes.push(styleList(properties));
  }

  // Then parse nested rules
  while (state.pos < state.css.length && peek(state) !== "}") {
    skipWhitespace(state);
    if (peek(state) === "}") break;

    if (peek(state) === "@") {
      nodes.push(parseAtRule(state));
    } else {
      // Check if this looks like a selector (for nested rules)
      const savedPos = state.pos;
      const possibleSelector = parseSelector(state);
      skipWhitespace(state);

      if (peek(state) === "{") {
        // It's a nested style block
        expect(state, "{");
        const body = parseBlock(state);
        expect(state, "}");
        nodes.push(
          styleBlock(possibleSelector, body.length === 1 ? body[0]! : body),
        );
      } else {
        // Revert - might be more properties
        state.pos = savedPos;
        break;
      }
    }
    skipWhitespace(state);
  }

  return nodes;
}

function tryParseProperties(state: ParserState): StyleProperties | null {
  const properties: Record<string, string> = {};

  while (state.pos < state.css.length) {
    skipWhitespace(state);

    // Stop at closing brace or nested selector/at-rule
    const char = peek(state);
    if (char === "}" || char === "@") break;

    // Check if this looks like a nested selector
    const savedPos = state.pos;
    const lookahead = lookAheadForSelector(state);
    if (lookahead) {
      state.pos = savedPos;
      break;
    }
    state.pos = savedPos;

    // Try to parse a property
    const property = parseProperty(state);
    if (!property) break;

    properties[property.name] = property.value;
  }

  return Object.keys(properties).length > 0 ?
      (properties as StyleProperties)
    : null;
}

function parseProperty(
  state: ParserState,
): { name: string; value: string } | null {
  skipWhitespace(state);

  const nameStart = state.pos;
  // Parse property name (allowing -- for CSS variables)
  while (state.pos < state.css.length) {
    const char = state.css[state.pos];
    if (char === ":" || char === "{" || char === "}") break;
    state.pos++;
  }

  const name = state.css.slice(nameStart, state.pos).trim();
  if (!name || peek(state) !== ":") {
    return null;
  }

  expect(state, ":");
  skipWhitespace(state);

  // Parse value until semicolon or closing brace
  const valueStart = state.pos;
  let depth = 0;
  while (state.pos < state.css.length) {
    const char = state.css[state.pos];
    if (char === "(") depth++;
    if (char === ")") depth--;
    if ((char === ";" || char === "}") && depth === 0) {
      break;
    }
    state.pos++;
  }

  const value = state.css.slice(valueStart, state.pos).trim();

  // Consume semicolon if present
  if (peek(state) === ";") {
    state.pos++;
  }

  return { name, value };
}

function parseSelector(state: ParserState): string {
  const start = state.pos;
  let depth = 0;

  while (state.pos < state.css.length) {
    const char = state.css[state.pos];

    if (char === "(") depth++;
    if (char === ")") depth--;

    if (char === "{" && depth === 0) {
      break;
    }

    state.pos++;
  }

  return state.css.slice(start, state.pos).trim();
}

function parseIdentifier(state: ParserState): string {
  const start = state.pos;

  while (state.pos < state.css.length) {
    const char = state.css[state.pos];
    if (char && !/[a-zA-Z0-9_-]/.test(char)) {
      break;
    }
    state.pos++;
  }

  return state.css.slice(start, state.pos);
}

function lookAheadForSelector(state: ParserState): boolean {
  let tempPos = state.pos;
  let foundColon = false;

  // Skip ahead looking for { which indicates a selector
  while (tempPos < state.css.length) {
    const char = state.css[tempPos];
    if (char === "{") return !foundColon; // It's a selector if no : before {
    if (char === ":") foundColon = true;
    if (char === ";" || char === "}") return false;
    tempPos++;
  }

  return false;
}

function peek(state: ParserState): string {
  return state.css[state.pos] || "";
}

function expect(state: ParserState, char: string): void {
  if (state.css[state.pos] !== char) {
    throw new Error(
      `Expected '${char}' at position ${state.pos}, got '${state.css[state.pos]}'`,
    );
  }
  state.pos++;
}

function skipWhitespace(state: ParserState): void {
  while (state.pos < state.css.length) {
    const char = state.css[state.pos];

    // Skip whitespace
    if (char && /\s/.test(char)) {
      state.pos++;
      continue;
    }

    // Skip comments
    if (char === "/" && state.css[state.pos + 1] === "*") {
      state.pos += 2;
      while (state.pos < state.css.length) {
        if (state.css[state.pos] === "*" && state.css[state.pos + 1] === "/") {
          state.pos += 2;
          break;
        }
        state.pos++;
      }
      continue;
    }

    break;
  }
}
