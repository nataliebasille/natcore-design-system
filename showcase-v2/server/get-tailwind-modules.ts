import "server-only";
import {
  type ComponentBuilder,
  isComponentBuilder,
  type ComponentState,
} from "@nataliebasille/css-engine";

export type TailwindModuleEntry = {
  category: string[];
  name: string;
};

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
