"use client";

import { useSidebar } from "@/providers/SidebarProvider";

export const SidebarToggle = () => {
  const { isOpened } = useSidebar();
  return (
    <input
      type="checkbox"
      readOnly
      className="layer-drawer-toggle"
      checked={isOpened}
    />
  );
};
