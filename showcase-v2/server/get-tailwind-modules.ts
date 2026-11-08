import "server-only";
import { readdir, stat } from "node:fs/promises";
import {
  type ComponentBuilder,
  isComponentBuilder,
  createDoc,
  type ComponentState,
} from "@nataliebasille/css-engine";
import path from "node:path";

export type TailwindModuleEntry = {
  category: string[];
  name: string;
};

export async function listTailwindModules(): Promise<TailwindModuleEntry[]> {
  const cwd = process.cwd();

  const fromShowcase = path.resolve(cwd, "../packages/core-v2/src/tailwind");
  const files = await getFiles(fromShowcase);

  const results: TailwindModuleEntry[] = [];

  for (const file of files) {
    const name = file.split("packages/core-v2/src/tailwind").slice(-1)[0];
    if (!name?.endsWith(".css.ts")) continue;

    const parts = name.split("/").filter((x) => !!x);
    const moduleName = parts.slice(-1)[0]!.replace(".css.ts", "");
    const folders = parts.slice(0, -1);
    // Components live in their own folder (components/button/button.css.ts);
    // drop that folder so the entry stays { category: ["components"], name: "button" }.
    const entry = {
      category:
        folders.at(-1) === moduleName ? folders.slice(0, -1) : folders,
      name: moduleName,
    };

    // Static `.css.ts` suffix so Turbopack's static analysis only bundles
    // style modules — not plain `.css` files that fail when processed in
    // isolation, or colocated `*.e2e.spec.ts` Playwright specs.
    // name = "/utilities/headings.css.ts"; slice(1,-7) = "utilities/headings"
    const imported = (await import(
      `../../packages/core-v2/src/tailwind/${name.slice(1, -7)}.css.ts`
    )) as { default?: unknown };

    if (isComponentBuilder(imported.default)) {
      results.push(entry);
    }
  }

  return results;
}

export async function getModuleDoc(entry: TailwindModuleEntry) {
  try {
    const [module, meta, playground] = await Promise.allSettled([
      import(
        `../../packages/core-v2/src/tailwind/${[...entry.category, entry.name, entry.name].join("/")}.css.ts`
      ),
      import(
        `../app/(docs)/_${entry.category[0]}/${entry.category.slice(1).concat(entry.name).join("/")}/doc.tsx`
      ),
      import(
        `../app/(docs)/_${entry.category[0]}/${entry.category.slice(1).concat(entry.name).join("/")}/playground.tsx`
      ),
    ]);

    if (
      module.status !== "fulfilled" ||
      meta.status !== "fulfilled" ||
      playground.status !== "fulfilled" ||
      !module.value?.default ||
      !isComponentBuilder(module.value.default) ||
      !meta.value?.default ||
      !playground.value?.default
    ) {
      return undefined;
    }

    return {
      module: module.value.default as ComponentBuilder<ComponentState>,
      meta: meta.value.default as Documentation<ComponentBuilder>,
      playground: playground.value.default as React.FC,
    };
  } catch (e) {
    return undefined;
  }
}

async function getFiles(basePath: string): Promise<string[]> {
  const entries = await readdir(basePath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(basePath, entry.name);
    const s = await stat(fullPath);
    if (s.isDirectory()) {
      files.push(...(await getFiles(fullPath)));
    } else if (s.isFile()) {
      files.push(fullPath.replace(/\\/g, "/"));
    }
  }

  return files;
}
