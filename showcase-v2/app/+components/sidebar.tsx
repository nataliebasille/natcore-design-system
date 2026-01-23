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
      <div className="uppercase tracking-wider text-800-surface text-sm p-4 pb-0 mb-2">
        {header}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
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
      className="px-3 py-2 pl-4 border-l-4 border-l-transparent text-500-primary rounded-sm hover:bg-100-primary/5 font-bold tracking-wider text-sm uppercase"
      activeClassName="border-l-500-accent bg-100-primary/10 text-500-accent"
    >
      {children}
    </NavLink>
  );
}
