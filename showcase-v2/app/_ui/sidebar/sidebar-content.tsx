import type React from "react";
import type { PropsWithChildren } from "react";
import NavLink from "../nav-link";
import { twMerge } from "tailwind-merge";
import { SidebarToggle } from "./sidebar-toggle";
import { Overline } from "../layout/overline";

export type SidebarProps = PropsWithChildren<{
  className?: string;
}>;

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <aside className={twMerge("p-2 px-3 max-tablet:tray-left", className)}>
      <SidebarToggle />
      {children}
    </aside>
  );
}

export type SidebarGroupProps = PropsWithChildren<{
  header: React.ReactNode;
  className?: string;
  /** Renders as an indented item inside a parent group's list. */
  nested?: boolean;
}>;

export function SidebarGroup({ header, children, nested }: SidebarGroupProps) {
  const Root = nested ? "li" : "div";

  return (
    <Root
      className={twMerge(
        "flex flex-col",
        nested && "ml-2 border-l border-surface-600/30 pl-2",
      )}
    >
      <Overline className={twMerge("mb-2 pt-4 pb-0", nested && "mb-1 pt-2")}>
        {header}
      </Overline>

      <ul className="flex flex-col gap-1 text-primary-500 dark:text-primary-900">
        {children}
      </ul>
    </Root>
  );
}

export type SidebarLinkProps = PropsWithChildren<{
  href: string;
}>;

export function SidebarLink({ href, children }: SidebarLinkProps) {
  return (
    <NavLink
      href={href}
      component="li"
      className="cursor-pointer rounded-lg border-l-2 border-transparent p-2 pl-2 text-sm tracking-wider text-(--tone-current-fg)/65 hover:bg-surface-200 hover:text-on-surface-200 active:rounded-l-none active:border-l-accent-500 active:bg-surface-200 active:text-on-surface-200"
    >
      {children}
    </NavLink>
  );
}
