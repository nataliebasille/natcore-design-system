"use client";

import { useSidebar } from "@/providers/SidebarProvider";

export const SidebarToggle = () => {
  const { isOpened } = useSidebar();
  return (
    <input
      type="checkbox"
      className="layer-drawer-toggle"
      defaultChecked={isOpened}
    />
  );
};
