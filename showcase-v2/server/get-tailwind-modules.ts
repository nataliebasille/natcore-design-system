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
    const parts = name?.split("/").filter((x) => !!x) || [];
    const entry = {
      category: parts.slice(0, -1),
      name: parts.slice(-1)[0]!.replace(".css.ts", ""),
    };

    if (!name?.endsWith(".css.ts")) continue;

    // Static `.ts` suffix so Turbopack's static analysis only bundles `.ts`
    // files — not plain `.css` files that fail when processed in isolation.
    // name = "/utilities/headings.css.ts"; slice(1,-3) = "utilities/headings.css"
    const imported = (await import(
      `../../packages/core-v2/src/tailwind/${name.slice(1, -3)}.ts`
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
        `../../packages/core-v2/src/tailwind/${[...entry.category, entry.name].join("/")}.css.ts`
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
