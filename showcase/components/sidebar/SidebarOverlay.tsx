'use client';

import { useSidebar } from '@/providers/SidebarProvider';

export const SidebarOverlay = () => {
  const { toggle } = useSidebar();

  return <div className='layer-overlay' onClick={toggle} />;
};
