import { readdir } from "fs/promises";
import path from "path";

import { List, Divider } from "@natcore/design-system-react";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "./Logo";

const getDirectories = async (source: string) =>
  (
    await readdir(
      path.resolve(import.meta.url.slice("file://".length), "../../", source),
      {
        withFileTypes: true,
      },
    )
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

export const Sidebar = async () => {
  console.log(import.meta.url);
  const [components, forms] = await Promise.all([
    getDirectories("component").then((all) =>
      createSidebarItems("component", all),
    ),
    getDirectories("form").then((all) => createSidebarItems("form", all)),
  ]);

  return (
    <>
      <Logo />
      <Divider />
      <div className="text-secondary-800 dark:text-secondary-300 mb-2 font-bold uppercase tracking-wider">
        Components
      </div>
      <List.Container color="primary">{components}</List.Container>

      <div className="text-secondary-800 dark:text-secondary-300 mb-2 mt-8 font-bold uppercase tracking-wider">
        Forms
      </div>

      <List.Container color="primary">{forms}</List.Container>
    </>
  );
};

function capitalizeEachWord(s: string) {
  return s
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function dashesToSpace(s: string) {
  return s.replace(/-/g, " ");
}

function createSidebarItems(type: "component" | "form", dirs: string[]) {
  return dirs.map((dir) => (
    <SidebarItem key={dir} href={`/${type}/${dir}`}>
      {capitalizeEachWord(dashesToSpace(dir))}
    </SidebarItem>
  ));
}
