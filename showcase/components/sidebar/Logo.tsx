'use client';

import { useRouter } from 'next/navigation';
import { LogoSVG } from '@natcore/design-system-core';
import { useSidebar } from '@/providers/SidebarProvider';
import { useCallback } from 'react';

export const Logo = () => {
  const router = useRouter();
  const { toggle } = useSidebar();

  const handleClick = useCallback(() => {
    router.push('/');
    toggle();
  }, [router, toggle]);
  return (
    <div
      className='-ml-3 inline-flex cursor-pointer rounded-md p-3 hover:bg-tertiary-100'
      onClick={handleClick}
    >
      <div className='font-bold text-primary'>
        <LogoSVG className='h-[3rem] w-[3rem]' />
      </div>
      <span className='ml-1 text-5xl text-primary'>at</span>
      <span className='text-5xl text-secondary'>Core</span>
    </div>
  );
};
