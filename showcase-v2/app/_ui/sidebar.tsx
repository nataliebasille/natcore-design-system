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
      <div className="text-surface-scale-800 border-l-scale-2 mb-2 border-transparent pt-4 pr-2 pb-0 pl-3 text-xs tracking-wider uppercase">
        {header}
      </div>

      <ul className="text-primary-scale-500 dark:text-primary-scale-900 flex flex-col gap-1">
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
      className="active:border-l-accent-scale-500 active:hover:border-l-accent-scale-500 hover:border-l-primary-scale-500/50 active:bg-primary-scale-100/10 hover:bg-primary-scale-100/10 active:text-accent-scale-500 rounded-none! border-l-4 border-transparent p-2 pl-2 text-sm font-bold tracking-wide hover:cursor-pointer"
    >
      {children}
    </NavLink>
  );
}
