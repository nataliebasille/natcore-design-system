"use client";

import { twMerge } from "tailwind-merge";
import { MenuIcon as Icon } from "../icons/menu";
import { useSidebar } from "../sidebar/sidebar-provider";

export function MenuIcon({ className }: { className?: string }) {
  const { toggle } = useSidebar();
  return (
    <button
      className={twMerge("btn btn-ghost/primary btn-icon", className)}
      onClick={toggle}
    >
      <Icon className="h-[1.5em] w-[1.5em]" />
    </button>
  );
}
