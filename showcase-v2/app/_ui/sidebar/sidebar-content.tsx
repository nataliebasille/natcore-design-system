import type React from "react";
import type { PropsWithChildren } from "react";
import NavLink from "../nav-link";
import { twMerge } from "tailwind-merge";
import { SidebarToggle } from "./sidebar-toggle";

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
}>;

export function SidebarGroup({ header, children }: SidebarGroupProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 border-transparent pt-4 pb-0 text-[.675rem] tracking-[.2em] text-(--tone-current-fg)/50 uppercase">
        {header}
      </div>

      <ul className="flex flex-col gap-1 text-tone-500-primary dark:text-tone-900-primary">
        {children}
      </ul>
    </div>
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
      className="cursor-pointer rounded-lg border-l-2 border-transparent p-2 pl-2 text-sm tracking-wider text-(--tone-current-fg)/65 hover:bg-tone-200-surface hover:text-on-tone-200-surface active:rounded-l-none active:border-l-tone-500-accent active:bg-tone-200-surface active:text-on-tone-200-surface"
    >
      {children}
    </NavLink>
  );
}
