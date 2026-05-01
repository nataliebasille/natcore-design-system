"use client";

import { useSidebar } from "./sidebar-provider";

export function SidebarToggle() {
  const { isOpen } = useSidebar();
  return (
    <input
      type="checkbox"
      data-slot="toggle"
      className="hidden"
      name="sidebar-toggle"
      checked={isOpen}
      readOnly
    />
  );
}
