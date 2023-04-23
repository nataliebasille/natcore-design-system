'use client';

import { useSidebar } from '@/providers/SidebarProvider';
import { hamburger as MenuSVG } from '@natcore/design-system-core';
import { Button } from '@natcore/design-system-react';

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => {
  const { toggle } = useSidebar();

  return (
    <Button className={className} onClick={toggle} color='ghost'>
      <MenuSVG className='h-full w-full' />
    </Button>
  );
};
