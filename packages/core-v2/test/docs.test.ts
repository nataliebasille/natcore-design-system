/**
 * Docs drift test. Every `*.docs.tsx` under `src/` is a showcase page, and must:
 *
 * - have no authoring issues (`toDocModel(...).issues` is empty);
 * - only use classes that produce CSS, so an example or playground never
 *   shows a typo or a class removed from its component;
 * - write every class it uses out literally somewhere in a docs file. The
 *   showcase's Tailwind build finds classes by scanning source text, so a
 *   class only built from a template (`btn-${v.variant}`) renders unstyled.
 *
 * Pages must also resolve to distinct URLs (see `resolveDocLocation`).
 *
 * Classes are collected from the at-a-glance content, every section's prose,
 * tables, and examples (both `<ui>` and `<markup>` sides), and the playground's
 * `render` for every combination of select and boolean controls. Text controls
 * use their default value.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { Scanner } from "@tailwindcss/oxide";
import {
  resolveDocLocation,
  toDocModel,
  type DocModel,
  type PlaygroundControlValue,
  type ResolvedControl,
} from "@nataliebasille/css-engine";
import type { ShowcaseJsxChild } from "@nataliebasille/preview-jsx-runtime";
import { buildNatcoreCss } from "./helpers/build-natcore-css.ts";

/** Classes that intentionally generate no CSS on their own. */
const NO_CSS_BY_DESIGN = new Set(["group", "peer"]);

const srcDir = fileURLToPath(new URL("../src/", import.meta.url));
const docsFiles = findDocsFiles(srcDir);
const scanner = new Scanner({});
const literalClasses = new Set(
  docsFiles.flatMap((file) => scanCandidates(fs.readFileSync(file, "utf8"))),
);

describe("scanCandidates", () => {
  it("keeps arbitrary values with CSS functions whole", () => {
    expect(
      scanCandidates(
        `<div className="w-[calc(100%-1rem)] bg-[rgb(0,0,0)] btn-solid/primary" />`,
      ),
    ).toEqual(
      expect.arrayContaining([
        "w-[calc(100%-1rem)]",
        "bg-[rgb(0,0,0)]",
        "btn-solid/primary",
      ]),
    );
  });
});

describe("docs files", () => {
  it("finds the docs files", () => {
    expect(docsFiles.length).toBeGreaterThan(0);
  });

  it("gives every page its own URL", async () => {
    const filesByUrl = new Map<string, string[]>();
    for (const file of docsFiles) {
      const location = resolveDocLocation(
        relative(file),
        await loadModel(file),
      );
      const url = `/${location.path.join("/")}`;
      filesByUrl.set(url, [...(filesByUrl.get(url) ?? []), relative(file)]);
    }

    const duplicates = [...filesByUrl]
      .filter(([, files]) => files.length > 1)
      .map(([url, files]) => `${url}: ${files.join(", ")}`);

    expect(duplicates).toEqual([]);
  });

  describe.each(docsFiles.map((file) => [relative(file), file]))(
    "%s",
    (_name, file) => {
      it("has no authoring issues", async () => {
        expect((await loadModel(file)).issues).toEqual([]);
      });

      it("only uses classes that produce CSS", async () => {
        const uses = collectPageClasses(await loadModel(file));
        const css = (await buildNatcoreCss([...uses.keys()])).toString();

        const missing = [...uses]
          .filter(
            ([className]) =>
              !NO_CSS_BY_DESIGN.has(className) && !hasClassRule(css, className),
          )
          .map(([className, where]) => `"${className}" in ${where}`);

        expect(missing).toEqual([]);
      });

      it("writes every class it uses out literally", async () => {
        const uses = collectPageClasses(await loadModel(file));

        const generatedOnly = [...uses]
          .filter(([className]) => !literalClasses.has(className))
          .map(([className, where]) => `"${className}" in ${where}`);

        expect(generatedOnly).toEqual([]);
      });
    },
  );
});

async function loadModel(file: string): Promise<DocModel> {
  const mod: unknown = await import(pathToFileURL(file).href);
  return toDocModel(
    typeof mod === "object" && mod !== null && "default" in mod ?
      mod.default
    : undefined,
  );
}

/** Every class the page renders, mapped to the first place it appears. */
function collectPageClasses(model: DocModel) {
  const uses = new Map<string, string>();
  const collect = (child: ShowcaseJsxChild, where: string) =>
    collectClasses(child, (className) => {
      if (!uses.has(className)) uses.set(className, where);
    });

  collect(model.atAGlance, "atAGlance");

  for (const block of model.blocks) {
    switch (block.kind) {
      case "prose":
        collect(block.node, "page prose");
        break;
      case "section": {
        const section = `<Section "${block.title}">`;
        block.table?.forEach((row) => collect(row.content, `${section} table`));
        block.content.forEach((content, index) => {
          if (content.kind === "prose") {
            collect(content.node, `${section} prose`);
            return;
          }
          const example = `${section} <Example "${content.title ?? `#${index + 1}`}">`;
          collect(content.source, example);
          content.table?.forEach((row) =>
            collect(row.content, `${example} table`),
          );
        });
        break;
      }
      case "playground":
        for (const values of controlCombinations(block.controls)) {
          collect(
            block.render(values),
            `<Playground> ${JSON.stringify(values)}`,
          );
        }
        break;
    }
  }

  return uses;
}

function collectClasses(
  child: ShowcaseJsxChild,
  add: (className: string) => void,
) {
  if (Array.isArray(child)) {
    child.forEach((c) => collectClasses(c, add));
    return;
  }

  if (typeof child !== "object" || child === null) return;

  if (typeof child.type === "function") {
    collectClasses(child.type(child.props), add);
    return;
  }

  for (const [key, value] of Object.entries(child.props)) {
    if (!/^(?:(?:ui|markup):)?(?:className|class)$/.test(key)) continue;
    for (const className of classTokens(value)) add(className);
  }

  collectClasses(child.props.children, add);
}

function classTokens(value: unknown): string[] {
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  if (Array.isArray(value)) return value.flatMap(classTokens);
  return [];
}

function controlCombinations(controls: readonly ResolvedControl[]) {
  return controls.reduce<Record<string, PlaygroundControlValue>[]>(
    (combinations, control) => {
      const options: PlaygroundControlValue[] =
        control.kind === "select" ? control.options
        : control.kind === "boolean" ? [false, true]
        : [control.default];

      return combinations.flatMap((values) =>
        options.map((option) => ({ ...values, [control.name]: option })),
      );
    },
    [{}],
  );
}

/** Whether `css` has a rule selecting `.className` (not just a longer class). */
function hasClassRule(css: string, className: string) {
  const selector = `.${cssEscape(className)}`;
  let index = css.indexOf(selector);

  while (index !== -1) {
    const next = css[index + selector.length];
    if (next === undefined || !/[\w\\-]/.test(next)) return true;
    index = css.indexOf(selector, index + 1);
  }

  return false;
}

// CSS.escape for class names, which isn't available in Node.
function cssEscape(className: string) {
  return [...className]
    .map((char, index) => {
      if (/[\w-]/.test(char) || char.charCodeAt(0) >= 0x80) {
        return index === 0 && /\d/.test(char) ?
            `\\${char.charCodeAt(0).toString(16)} `
          : char;
      }
      return `\\${char}`;
    })
    .join("");
}

// The class candidates Tailwind's own scanner finds in source text, which is
// what decides whether the showcase build generates a class.
function scanCandidates(content: string) {
  return scanner
    .getCandidatesWithPositions({ content, extension: "tsx" })
    .map(({ candidate }) => candidate);
}

function findDocsFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter(
      (file) =>
        file.endsWith(".docs.tsx") &&
        !/(^|[\\/])(node_modules|dist)[\\/]/.test(file),
    )
    .map((file) => path.join(dir, file))
    .sort();
}

function relative(file: string) {
  return path.relative(srcDir, file).replaceAll("\\", "/");
}
