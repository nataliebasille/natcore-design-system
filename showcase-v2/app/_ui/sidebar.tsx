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
      <div className="text-surface-800 mb-2 border-l-2 border-transparent p-4 pb-0 pl-2 text-xs tracking-wider uppercase">
        {header}
      </div>
      <ul className="list interactive text-primary-500">{children}</ul>
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
      className="active:border-l-accent-500! active:bg-primary-100/10! active:text-accent-500! rounded-none! border-l-4 border-transparent text-sm font-bold tracking-wide"
    >
      {children}
    </NavLink>
  );
}
