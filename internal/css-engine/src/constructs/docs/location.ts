import type { DocNav } from "./markers";

/** Where a docs page lives on the site. */
export type DocLocation = {
  /** URL path segments, e.g. `["components", "button"]`. */
  path: string[];
  /** Sidebar group labels, outermost first; empty for a top-level page. */
  group: string[];
  label: string;
  order?: number;
};

/**
 * Resolves a docs page's URL and sidebar placement from its file, relative to
 * core-v2's `src/` (e.g. `tailwind/components/button/button.docs.tsx`), and
 * its `<Page>`'s `title` and `nav`. The leading `tailwind/` folder is dropped,
 * and a page in a folder of its own name (`button/button.docs.tsx`) is named
 * by that folder once.
 */
export function resolveDocLocation(
  file: string,
  page: { title: string; nav?: DocNav },
): DocLocation {
  const parts = file
    .replaceAll("\\", "/")
    .replace(/\.docs\.tsx$/, "")
    .split("/")
    .filter(Boolean);
  const relative = parts[0] === "tailwind" ? parts.slice(1) : parts;
  const name = relative.at(-1) ?? "";
  const folders = relative.slice(0, -1);
  const groupFolders = folders.at(-1) === name ? folders.slice(0, -1) : folders;
  const { nav } = page;

  return {
    path:
      nav?.path !== undefined ?
        nav.path.split("/").filter(Boolean)
      : [...groupFolders, name],
    group:
      nav?.group === undefined ? groupFolders.map(toLabel)
      : nav.group === "" ? []
      : [nav.group],
    label: nav?.label ?? page.title,
    ...(nav?.order !== undefined ? { order: nav.order } : {}),
  };
}

function toLabel(folder: string) {
  const words = folder.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
