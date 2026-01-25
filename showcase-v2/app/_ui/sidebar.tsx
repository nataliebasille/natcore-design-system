import type React from "react";
import type { PropsWithChildren } from "react";
import NavLink from "./nav-link";
import { twMerge } from "tailwind-merge";

export type SidebarProps = PropsWithChildren<{
  className?: string;
}>;

export function Sidebar({ className, children }: SidebarProps) {
  return <aside className={twMerge("p-4", className)}>{children}</aside>;
}

export type SidebarGroupProps = PropsWithChildren<{
  header: React.ReactNode;
  className?: string;
}>;

export function SidebarGroup({ header, children }: SidebarGroupProps) {
  return (
    <div className="flex flex-col">
      <div className="uppercase tracking-wider text-800-surface text-xs p-4 pl-2 border-l-2 border-transparent pb-0 mb-2">
        {header}
      </div>
      <ul className="list interactive text-500-primary">{children}</ul>
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
      className="border-l-4 rounded-none! font-bold tracking-wide text-sm border-transparent active:border-l-500-accent! active:bg-100-primary/10! active:text-500-accent!"
    >
      {children}
    </NavLink>
  );
}
