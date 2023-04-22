'use client';

import { useSidebar } from '@/providers/SidebarProvider';
import { hamburger as HamburgerSVG } from '@natcore/design-system-core';

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => {
  const { toggle } = useSidebar();

  return <HamburgerSVG className={className} onClick={toggle} />;
};
