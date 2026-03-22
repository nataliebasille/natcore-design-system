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
    <aside className={twMerge("p-4 max-tablet:tray-left", className)}>
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
      <div className="border-l-scale-2 mb-2 border-transparent pt-4 pr-2 pb-0 pl-3 text-xs tracking-wider text-tone-800-surface uppercase">
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
      className="rounded-none! border-l-4 border-transparent p-2 pl-2 text-sm font-bold tracking-wide hover:cursor-pointer hover:border-l-tone-500-primary/50 hover:bg-tone-100-primary/10 active:border-l-tone-500-accent active:bg-tone-100-primary/10 active:text-tone-500-accent active:hover:border-l-tone-500-accent"
    >
      {children}
    </NavLink>
  );
}
