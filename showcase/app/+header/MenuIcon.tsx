"use client";

import { useSidebar } from "@/providers/SidebarProvider";
import { HamburgerSVG } from "@natcore/icons/hamburger";
import { Button } from "@natcore/design-system-react";

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => {
  const { toggle } = useSidebar();

  return (
    <Button className={className} onClick={toggle} color="ghost">
      <HamburgerSVG className="h-full w-full" />
    </Button>
  );
};
